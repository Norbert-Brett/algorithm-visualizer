"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Shuffle, Play, RotateCcw } from "lucide-react";

interface FisherYatesShuffleVisualizationProps {
  isPlaying?: boolean;
  speed: number;
}

interface ArrayItem {
  id: number;
  value: number;
  isCurrentIndex?: boolean;
  isRandomIndex?: boolean;
  isShuffled?: boolean;
}

export default function FisherYatesShuffleVisualization({
  speed,
}: FisherYatesShuffleVisualizationProps) {
  const [array, setArray] = useState<ArrayItem[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);

  // Initialize with sequential array
  useEffect(() => {
    generateSequentialArray();
  }, []);

  const generateSequentialArray = () => {
    const newArray: ArrayItem[] = [];
    for (let i = 0; i < 8; i++) {
      newArray.push({
        id: i,
        value: i + 1,
      });
    }
    setArray(newArray);
    setCurrentStep(0);
    setTotalSteps(0);
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

  const fisherYatesShuffle = async () => {
    if (isAnimating) return;

    setIsAnimating(true);
    const arr = [...array];
    const n = arr.length;
    setTotalSteps(n);

    for (let i = n - 1; i > 0; i--) {
      setCurrentStep(n - i);

      // Highlight current index
      arr[i].isCurrentIndex = true;
      setArray([...arr]);
      await new Promise((resolve) => setTimeout(resolve, 800 / speed));

      // Pick random index
      const j = Math.floor(Math.random() * (i + 1));
      arr[j].isRandomIndex = true;
      setArray([...arr]);
      await new Promise((resolve) => setTimeout(resolve, 800 / speed));

      // Swap elements
      [arr[i], arr[j]] = [arr[j], arr[i]];
      setArray([...arr]);
      await new Promise((resolve) => setTimeout(resolve, 600 / speed));

      // Mark as shuffled and clear highlights
      arr[i].isShuffled = true;
      arr[i].isCurrentIndex = false;
      arr[j].isRandomIndex = false;
      setArray([...arr]);
      await new Promise((resolve) => setTimeout(resolve, 400 / speed));
    }

    // Mark first element as shuffled
    arr[0].isShuffled = true;
    setArray([...arr]);
    setIsAnimating(false);
  };

  const reset = () => {
    setArray((prev) =>
      prev.map((item) => ({
        ...item,
        isCurrentIndex: false,
        isRandomIndex: false,
        isShuffled: false,
      }))
    );
    setIsAnimating(false);
    setCurrentStep(0);
    setTotalSteps(0);
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
          Fisher-Yates Shuffle Visualization
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          The Fisher-Yates shuffle algorithm produces an unbiased random permutation
          by iterating through the array and swapping each element with a randomly
          selected element from the remaining unshuffled portion.
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
              onClick={fisherYatesShuffle}
              disabled={isAnimating || array.length < 2}
            >
              <Play className="h-4 w-4 mr-2" />
              Shuffle
            </Button>
            <Button onClick={reset} variant="outline" disabled={isAnimating}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>

          <Button
            onClick={generateSequentialArray}
            variant="outline"
            disabled={isAnimating}
          >
            <Shuffle className="h-4 w-4 mr-2" />
            Sequential Array
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
                  {isAnimating ? "Shuffling..." : "Ready"}
                </Badge>
              </div>
              {isAnimating && (
                <div className="flex items-center justify-between">
                  <span>Progress:</span>
                  <Badge variant="secondary">
                    {currentStep} / {totalSteps}
                  </Badge>
                </div>
              )}
            </div>

            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-muted-foreground font-medium">
                  Current Index
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded"></div>
                <span className="text-muted-foreground font-medium">
                  Random Index
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-600 rounded"></div>
                <span className="text-muted-foreground font-medium">
                  Shuffled
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-muted-foreground rounded"></div>
                <span className="text-muted-foreground font-medium">
                  Unshuffled
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
                      item.isShuffled
                        ? "bg-green-600"
                        : item.isCurrentIndex
                        ? "bg-blue-500"
                        : item.isRandomIndex
                        ? "bg-purple-500"
                        : "bg-muted-foreground"
                    }
                  `}
                  style={{ height: `${item.value * 20}px`, minHeight: '40px' }}
                  animate={{
                    scale: item.isCurrentIndex || item.isRandomIndex ? 1.15 : 1,
                    y: item.isCurrentIndex || item.isRandomIndex ? -10 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="text-white text-xs sm:text-sm font-mono mb-1 font-bold">
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
