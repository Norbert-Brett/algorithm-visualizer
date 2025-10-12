"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Shuffle, Play, RotateCcw } from "lucide-react";

interface BubbleSortVisualizationProps {
  isPlaying: boolean;
  speed: number;
}

interface ArrayItem {
  id: number;
  value: number;
  isComparing?: boolean;
  isSwapping?: boolean;
  isSorted?: boolean;
}

export default function BubbleSortVisualization({
  speed,
}: BubbleSortVisualizationProps) {
  const [array, setArray] = useState<ArrayItem[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // Initialize with random array
  useEffect(() => {
    generateRandomArray();
  }, []);

  const generateRandomArray = () => {
    const newArray: ArrayItem[] = [];
    for (let i = 0; i < 8; i++) {
      newArray.push({
        id: i,
        value: Math.floor(Math.random() * 100) + 1,
      });
    }
    setArray(newArray);
  };

  const addElement = () => {
    const value = parseInt(inputValue);
    if (!isNaN(value) && value > 0 && value <= 100) {
      const newItem: ArrayItem = {
        id: array.length,
        value: value,
      };
      setArray((prev) => [...prev, newItem]);
      setInputValue("");
    }
  };

  const bubbleSort = async () => {
    if (isAnimating) return;

    setIsAnimating(true);
    const arr = [...array];
    const n = arr.length;

    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        // Highlight comparing elements
        arr[j].isComparing = true;
        arr[j + 1].isComparing = true;
        setArray([...arr]);
        await new Promise((resolve) => setTimeout(resolve, 1000 / speed));

        if (arr[j].value > arr[j + 1].value) {
          // Highlight swapping elements
          arr[j].isSwapping = true;
          arr[j + 1].isSwapping = true;
          setArray([...arr]);
          await new Promise((resolve) => setTimeout(resolve, 500 / speed));

          // Swap
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          setArray([...arr]);
          await new Promise((resolve) => setTimeout(resolve, 500 / speed));

          arr[j].isSwapping = false;
          arr[j + 1].isSwapping = false;
        }

        arr[j].isComparing = false;
        arr[j + 1].isComparing = false;
      }
      // Mark as sorted
      arr[n - 1 - i].isSorted = true;
    }
    arr[0].isSorted = true;
    setArray([...arr]);
    setIsAnimating(false);
  };

  const reset = () => {
    setArray((prev) =>
      prev.map((item) => ({
        ...item,
        isComparing: false,
        isSwapping: false,
        isSorted: false,
      }))
    );
    setIsAnimating(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addElement();
    }
  };

  return (
    <div className="h-full flex flex-col p-2 sm:p-0">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-2 text-foreground">
          Bubble Sort Visualization
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Bubble sort repeatedly steps through the list, compares adjacent
          elements and swaps them if they are in the wrong order.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 flex-1">
        {/* Controls */}
        <div className="w-full lg:w-80 space-y-4 order-2 lg:order-1">
          <div className="space-y-2">
            <label className="text-sm font-medium">Add Element (1-100)</label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter number..."
                min="1"
                max="100"
              />
              <Button
                onClick={addElement}
                disabled={!inputValue || isAnimating}
              >
                Add
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={bubbleSort}
              disabled={isAnimating || array.length < 2}
            >
              <Play className="h-4 w-4 mr-2" />
              Sort
            </Button>
            <Button onClick={reset} variant="outline" disabled={isAnimating}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>

          <Button
            onClick={generateRandomArray}
            variant="outline"
            disabled={isAnimating}
          >
            <Shuffle className="h-4 w-4 mr-2" />
            Random Array
          </Button>

          <div className="pt-4 border-t">
            <div className="text-sm space-y-2">
              <div className="flex items-center justify-between">
                <span>Array Size:</span>
                <Badge variant="secondary">{array.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Status:</span>
                <Badge variant={isAnimating ? "default" : "outline"}>
                  {isAnimating ? "Sorting..." : "Ready"}
                </Badge>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span className="text-muted-foreground font-medium">
                  Comparing
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-destructive rounded"></div>
                <span className="text-muted-foreground font-medium">
                  Swapping
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-600 rounded"></div>
                <span className="text-muted-foreground font-medium">
                  Sorted
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-muted-foreground rounded"></div>
                <span className="text-muted-foreground font-medium">
                  Unsorted
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Visualization */}
        <div className="flex-1 flex items-end justify-center pb-10 lg:pb-20 min-h-[300px] order-1 lg:order-2 overflow-x-auto">
          <div className="flex items-end gap-1 sm:gap-2 min-w-max">
            {array.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                className="w-8 sm:w-12 flex flex-col items-center gap-1 sm:gap-2"
              >
                <motion.div
                  className={`
                    w-full rounded-t-lg flex items-end justify-center
                    transition-colors duration-300
                    ${
                      item.isSorted
                        ? "bg-green-600"
                        : item.isSwapping
                        ? "bg-destructive"
                        : item.isComparing
                        ? "bg-yellow-500"
                        : "bg-muted-foreground"
                    }
                  `}
                  style={{ height: `${item.value * 2}px`, minHeight: '20px' }}
                  animate={{
                    scale: item.isComparing || item.isSwapping ? 1.1 : 1,
                    y: item.isSwapping ? -10 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="text-white text-[10px] sm:text-xs font-mono mb-1">
                    {item.value}
                  </span>
                </motion.div>
                <div className="text-[10px] sm:text-xs text-muted-foreground font-mono font-medium">
                  {index}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
