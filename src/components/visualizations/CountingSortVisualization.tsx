"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Shuffle, Play, RotateCcw } from "lucide-react";

interface CountingSortVisualizationProps {
  isPlaying: boolean;
  speed: number;
}

interface ArrayItem {
  id: number;
  value: number;
  isCounting?: boolean;
  isPlacing?: boolean;
}

interface CountItem {
  value: number;
  count: number;
  isActive?: boolean;
  isCumulative?: boolean;
}

export default function CountingSortVisualization({
  speed,
}: CountingSortVisualizationProps) {
  const [array, setArray] = useState<ArrayItem[]>([]);
  const [countArray, setCountArray] = useState<CountItem[]>([]);
  const [outputArray, setOutputArray] = useState<ArrayItem[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [phase, setPhase] = useState<"initial" | "counting" | "cumulative" | "placing" | "done">("initial");
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
        value: Math.floor(Math.random() * 20) + 1, // Smaller range for counting sort
      });
    }
    setArray(newArray);
    setNextId(baseId + 8);
    setCountArray([]);
    setOutputArray([]);
    setPhase("initial");
  };

  const addElement = () => {
    const value = parseInt(inputValue);
    if (!isNaN(value) && value > 0 && value <= 20) {
      const newItem: ArrayItem = {
        id: nextId,
        value: value,
      };
      setArray((prev) => [...prev, newItem]);
      setNextId(nextId + 1);
      setInputValue("");
    }
  };

  const countingSort = async () => {
    if (isAnimating) return;

    setIsAnimating(true);
    const arr = [...array];
    const n = arr.length;

    // Find max value
    const max = Math.max(...arr.map(item => item.value));

    // Phase 1: Initialize count array
    const counts: CountItem[] = [];
    for (let i = 0; i <= max; i++) {
      counts.push({ value: i, count: 0 });
    }
    setCountArray([...counts]);
    await new Promise((resolve) => setTimeout(resolve, 800 / speed));

    // Phase 2: Count occurrences
    setPhase("counting");
    for (let i = 0; i < n; i++) {
      arr[i].isCounting = true;
      setArray([...arr]);
      
      const value = arr[i].value;
      counts[value].isActive = true;
      setCountArray([...counts]);
      await new Promise((resolve) => setTimeout(resolve, 800 / speed));

      counts[value].count++;
      setCountArray([...counts]);
      await new Promise((resolve) => setTimeout(resolve, 600 / speed));

      counts[value].isActive = false;
      arr[i].isCounting = false;
      setArray([...arr]);
      setCountArray([...counts]);
      await new Promise((resolve) => setTimeout(resolve, 300 / speed));
    }

    await new Promise((resolve) => setTimeout(resolve, 800 / speed));

    // Phase 3: Calculate cumulative counts
    setPhase("cumulative");
    for (let i = 1; i <= max; i++) {
      counts[i - 1].isCumulative = true;
      counts[i].isCumulative = true;
      setCountArray([...counts]);
      await new Promise((resolve) => setTimeout(resolve, 600 / speed));

      counts[i].count += counts[i - 1].count;
      setCountArray([...counts]);
      await new Promise((resolve) => setTimeout(resolve, 600 / speed));

      counts[i - 1].isCumulative = false;
      counts[i].isCumulative = false;
      setCountArray([...counts]);
    }

    await new Promise((resolve) => setTimeout(resolve, 800 / speed));

    // Phase 4: Place elements in output array
    setPhase("placing");
    const output: ArrayItem[] = new Array(n);

    for (let i = n - 1; i >= 0; i--) {
      arr[i].isPlacing = true;
      setArray([...arr]);
      
      const value = arr[i].value;
      counts[value].isActive = true;
      setCountArray([...counts]);
      await new Promise((resolve) => setTimeout(resolve, 800 / speed));

      const position = counts[value].count - 1;
      output[position] = { ...arr[i], isPlacing: false };
      setOutputArray([...output.filter(item => item !== undefined)]);
      await new Promise((resolve) => setTimeout(resolve, 600 / speed));

      counts[value].count--;
      counts[value].isActive = false;
      arr[i].isPlacing = false;
      setArray([...arr]);
      setCountArray([...counts]);
      await new Promise((resolve) => setTimeout(resolve, 400 / speed));
    }

    setPhase("done");
    setIsAnimating(false);
  };

  const reset = () => {
    setArray((prev) =>
      prev.map((item) => ({
        ...item,
        isCounting: false,
        isPlacing: false,
      }))
    );
    setCountArray([]);
    setOutputArray([]);
    setPhase("initial");
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
          Counting Sort Visualization
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Counting sort counts occurrences of each value, calculates cumulative counts, then places elements in sorted order.
        </p>
      </div>

      <div className="flex flex-col gap-4 flex-1">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium">Add Element (1-20)</label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter number..."
                min="1"
                max="20"
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
              onClick={countingSort}
              disabled={isAnimating || array.length < 2}
            >
              <Play className="h-4 w-4 mr-2" />
              Sort
            </Button>
            <Button onClick={reset} variant="outline" disabled={isAnimating}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button
              onClick={generateRandomArray}
              variant="outline"
              disabled={isAnimating}
            >
              <Shuffle className="h-4 w-4 mr-2" />
              Random
            </Button>
          </div>
        </div>

        {/* Status */}
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span>Array Size:</span>
            <Badge variant="secondary">{array.length}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span>Phase:</span>
            <Badge variant="default">
              {phase === "initial" ? "Ready" : 
               phase === "counting" ? "Counting" :
               phase === "cumulative" ? "Cumulative" :
               phase === "placing" ? "Placing" : "Complete"}
            </Badge>
          </div>
        </div>

        {/* Visualization */}
        <div className="flex-1 flex flex-col gap-4 overflow-auto">
          {/* Original Array */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Original Array</h3>
            <div className="flex items-end gap-1 sm:gap-2 overflow-x-auto pb-2">
              {array.map((item, index) => (
                <motion.div
                  key={item.id}
                  className="w-8 sm:w-12 flex flex-col items-center gap-1"
                >
                  <motion.div
                    className={`
                      w-full rounded-t-lg flex items-end justify-center
                      transition-colors duration-300
                      ${item.isCounting ? "bg-yellow-500" :
                        item.isPlacing ? "bg-blue-500" :
                        "bg-muted-foreground"}
                    `}
                    style={{ height: `${item.value * 8}px`, minHeight: "20px" }}
                    animate={{
                      scale: item.isCounting || item.isPlacing ? 1.1 : 1,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className="text-white text-[10px] sm:text-xs font-mono mb-1">
                      {item.value}
                    </span>
                  </motion.div>
                  <div className="text-[10px] text-muted-foreground font-mono">
                    {index}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Count Array */}
          {countArray.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">
                Count Array {phase === "cumulative" || phase === "placing" || phase === "done" ? "(Cumulative)" : ""}
              </h3>
              <div className="flex gap-1 overflow-x-auto pb-2">
                {countArray.map((item) => (
                  <motion.div
                    key={item.value}
                    className="flex flex-col items-center gap-1 min-w-[40px]"
                  >
                    <motion.div
                      className={`
                        w-full px-2 py-3 rounded text-center font-mono text-sm
                        transition-colors duration-300
                        ${item.isActive ? "bg-destructive text-white" :
                          item.isCumulative ? "bg-purple-500 text-white" :
                          item.count > 0 ? "bg-primary/20" : "bg-muted/50"}
                      `}
                      animate={{
                        scale: item.isActive || item.isCumulative ? 1.1 : 1,
                      }}
                    >
                      {item.count}
                    </motion.div>
                    <div className="text-[10px] text-muted-foreground font-mono">
                      {item.value}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Output Array */}
          {outputArray.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Output Array (Sorted)</h3>
              <div className="flex items-end gap-1 sm:gap-2 overflow-x-auto pb-2">
                {outputArray.map((item, index) => (
                  <motion.div
                    key={`output-${item.id}`}
                    layout
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-8 sm:w-12 flex flex-col items-center gap-1"
                  >
                    <motion.div
                      className="w-full rounded-t-lg flex items-end justify-center bg-green-600"
                      style={{ height: `${item.value * 8}px`, minHeight: "20px" }}
                    >
                      <span className="text-white text-[10px] sm:text-xs font-mono mb-1">
                        {item.value}
                      </span>
                    </motion.div>
                    <div className="text-[10px] text-muted-foreground font-mono">
                      {index}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
