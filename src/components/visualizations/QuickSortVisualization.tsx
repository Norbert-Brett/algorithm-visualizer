"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Shuffle, Play, RotateCcw } from "lucide-react";

interface QuickSortVisualizationProps {
  isPlaying: boolean;
  speed: number;
}

interface ArrayItem {
  id: number;
  value: number;
  isPivot?: boolean;
  isComparing?: boolean;
  isSwapping?: boolean;
  isSorted?: boolean;
  isInPartition?: boolean;
}

export default function QuickSortVisualization({
  speed,
}: QuickSortVisualizationProps) {
  const [array, setArray] = useState<ArrayItem[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [partitionLevel, setPartitionLevel] = useState(0);
  const [nextId, setNextId] = useState(0);

  useEffect(() => {
    generateRandomArray();
  }, []);

  const generateRandomArray = () => {
    const newArray: ArrayItem[] = [];
    const baseId = Date.now() * 1000;
    for (let i = 0; i < 8; i++) {
      newArray.push({
        id: baseId + i,
        value: Math.floor(Math.random() * 100) + 1,
      });
    }
    setArray(newArray);
    setNextId(baseId + 8);
    setPartitionLevel(0);
  };

  const addElement = () => {
    const value = parseInt(inputValue);
    if (!isNaN(value) && value > 0 && value <= 100) {
      const newItem: ArrayItem = {
        id: nextId,
        value: value,
      };
      setArray((prev) => [...prev, newItem]);
      setNextId(nextId + 1);
      setInputValue("");
    }
  };

  const quickSort = async () => {
    if (isAnimating) return;

    setIsAnimating(true);
    const arr = [...array];
    await quickSortHelper(arr, 0, arr.length - 1, 0);
    
    // Mark all as sorted
    arr.forEach((item) => {
      item.isSorted = true;
      item.isPivot = false;
      item.isInPartition = false;
    });
    setArray([...arr]);
    setPartitionLevel(0);
    setIsAnimating(false);
  };

  const quickSortHelper = async (
    arr: ArrayItem[],
    low: number,
    high: number,
    level: number
  ) => {
    if (low < high) {
      setPartitionLevel(level);
      
      // Highlight partition range
      for (let i = low; i <= high; i++) {
        arr[i].isInPartition = true;
      }
      setArray([...arr]);
      await new Promise((resolve) => setTimeout(resolve, 600 / speed));

      const pivotIndex = await partition(arr, low, high);
      
      // Mark pivot as sorted
      arr[pivotIndex].isSorted = true;
      arr[pivotIndex].isPivot = false;
      arr[pivotIndex].isInPartition = false;
      setArray([...arr]);
      await new Promise((resolve) => setTimeout(resolve, 400 / speed));

      // Clear partition highlights
      for (let i = low; i <= high; i++) {
        arr[i].isInPartition = false;
      }
      setArray([...arr]);

      // Recursively sort left and right partitions
      await quickSortHelper(arr, low, pivotIndex - 1, level + 1);
      await quickSortHelper(arr, pivotIndex + 1, high, level + 1);
    } else if (low === high) {
      // Single element is sorted
      arr[low].isSorted = true;
      setArray([...arr]);
    }
  };

  const partition = async (
    arr: ArrayItem[],
    low: number,
    high: number
  ): Promise<number> => {
    // Choose last element as pivot
    const pivot = arr[high].value;
    arr[high].isPivot = true;
    setArray([...arr]);
    await new Promise((resolve) => setTimeout(resolve, 800 / speed));

    let i = low - 1;

    for (let j = low; j < high; j++) {
      // Compare with pivot
      arr[j].isComparing = true;
      setArray([...arr]);
      await new Promise((resolve) => setTimeout(resolve, 600 / speed));

      if (arr[j].value < pivot) {
        i++;
        
        if (i !== j) {
          // Swap elements
          arr[i].isSwapping = true;
          arr[j].isSwapping = true;
          setArray([...arr]);
          await new Promise((resolve) => setTimeout(resolve, 400 / speed));

          [arr[i], arr[j]] = [arr[j], arr[i]];
          setArray([...arr]);
          await new Promise((resolve) => setTimeout(resolve, 400 / speed));

          arr[i].isSwapping = false;
          arr[j].isSwapping = false;
        }
      }
      
      arr[j].isComparing = false;
      setArray([...arr]);
      await new Promise((resolve) => setTimeout(resolve, 200 / speed));
    }

    // Place pivot in correct position
    i++;
    if (i !== high) {
      arr[i].isSwapping = true;
      arr[high].isSwapping = true;
      setArray([...arr]);
      await new Promise((resolve) => setTimeout(resolve, 500 / speed));

      [arr[i], arr[high]] = [arr[high], arr[i]];
      setArray([...arr]);
      await new Promise((resolve) => setTimeout(resolve, 500 / speed));

      arr[i].isSwapping = false;
      arr[high].isSwapping = false;
    }

    return i;
  };

  const reset = () => {
    setArray((prev) =>
      prev.map((item) => ({
        ...item,
        isPivot: false,
        isComparing: false,
        isSwapping: false,
        isSorted: false,
        isInPartition: false,
      }))
    );
    setPartitionLevel(0);
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
          Quick Sort Visualization
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Quick sort picks a pivot element and partitions the array around it, then recursively sorts the partitions.
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
              onClick={quickSort}
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
                <span>Partition Level:</span>
                <Badge variant="default">{partitionLevel}</Badge>
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
                <div className="w-3 h-3 bg-purple-500 rounded"></div>
                <span className="text-muted-foreground font-medium">
                  Pivot
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-muted-foreground font-medium">
                  Partition
                </span>
              </div>
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
                        : item.isPivot
                        ? "bg-purple-500"
                        : item.isSwapping
                        ? "bg-destructive"
                        : item.isComparing
                        ? "bg-yellow-500"
                        : item.isInPartition
                        ? "bg-blue-500"
                        : "bg-muted-foreground"
                    }
                  `}
                  style={{ height: `${item.value * 2}px`, minHeight: "20px" }}
                  animate={{
                    scale: item.isPivot || item.isComparing || item.isSwapping ? 1.1 : 1,
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
