"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Shuffle, Play, RotateCcw } from "lucide-react";

interface BucketSortVisualizationProps {
  isPlaying: boolean;
  speed: number;
}

interface ArrayItem {
  id: number;
  value: number;
  isDistributing?: boolean;
  isSorting?: boolean;
  isMerging?: boolean;
  bucketIndex?: number;
}

interface Bucket {
  index: number;
  items: ArrayItem[];
}

export default function BucketSortVisualization({
  speed,
}: BucketSortVisualizationProps) {
  const [array, setArray] = useState<ArrayItem[]>([]);
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [phase, setPhase] = useState<"initial" | "distributing" | "sorting" | "merging" | "done">("initial");
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
    setBuckets([]);
    setPhase("initial");
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

  const bucketSort = async () => {
    if (isAnimating) return;

    setIsAnimating(true);
    const arr = [...array];
    const n = arr.length;
    const bucketCount = 5;
    
    // Initialize buckets
    const newBuckets: Bucket[] = [];
    for (let i = 0; i < bucketCount; i++) {
      newBuckets.push({ index: i, items: [] });
    }

    // Phase 1: Distribute elements into buckets
    setPhase("distributing");
    for (let i = 0; i < n; i++) {
      arr[i].isDistributing = true;
      setArray([...arr]);
      await new Promise((resolve) => setTimeout(resolve, 800 / speed));

      const bucketIndex = Math.min(
        Math.floor((arr[i].value / 100) * bucketCount),
        bucketCount - 1
      );
      
      arr[i].bucketIndex = bucketIndex;
      newBuckets[bucketIndex].items.push({ ...arr[i] });
      setBuckets([...newBuckets]);
      await new Promise((resolve) => setTimeout(resolve, 600 / speed));

      arr[i].isDistributing = false;
      setArray([...arr]);
    }

    await new Promise((resolve) => setTimeout(resolve, 800 / speed));

    // Phase 2: Sort individual buckets
    setPhase("sorting");
    for (let i = 0; i < bucketCount; i++) {
      if (newBuckets[i].items.length > 0) {
        // Highlight bucket being sorted
        newBuckets[i].items.forEach(item => item.isSorting = true);
        setBuckets([...newBuckets]);
        await new Promise((resolve) => setTimeout(resolve, 800 / speed));

        // Simple insertion sort for each bucket
        const bucketItems = newBuckets[i].items;
        for (let j = 1; j < bucketItems.length; j++) {
          const key = bucketItems[j].value;
          const keyItem = { ...bucketItems[j] };
          let k = j - 1;

          while (k >= 0 && bucketItems[k].value > key) {
            bucketItems[k + 1] = bucketItems[k];
            k--;
          }
          bucketItems[k + 1] = keyItem;
        }

        newBuckets[i].items.forEach(item => item.isSorting = false);
        setBuckets([...newBuckets]);
        await new Promise((resolve) => setTimeout(resolve, 600 / speed));
      }
    }

    // Phase 3: Merge buckets back into array
    setPhase("merging");
    const sortedArray: ArrayItem[] = [];

    for (let i = 0; i < bucketCount; i++) {
      for (const item of newBuckets[i].items) {
        item.isMerging = true;
        setBuckets([...newBuckets]);
        await new Promise((resolve) => setTimeout(resolve, 400 / speed));

        sortedArray.push({
          ...item,
          isMerging: false,
          bucketIndex: undefined,
        });
        setArray([...sortedArray]);
        await new Promise((resolve) => setTimeout(resolve, 400 / speed));
      }
    }

    setPhase("done");
    setBuckets([]);
    setIsAnimating(false);
  };

  const reset = () => {
    setArray((prev) =>
      prev.map((item) => ({
        ...item,
        isDistributing: false,
        isSorting: false,
        isMerging: false,
        bucketIndex: undefined,
      }))
    );
    setBuckets([]);
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
          Bucket Sort Visualization
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Bucket sort distributes elements into buckets, sorts each bucket, then concatenates them.
        </p>
      </div>

      <div className="flex flex-col gap-4 flex-1">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 space-y-2">
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
              onClick={bucketSort}
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
               phase === "distributing" ? "Distributing" :
               phase === "sorting" ? "Sorting Buckets" :
               phase === "merging" ? "Merging" : "Complete"}
            </Badge>
          </div>
        </div>

        {/* Visualization */}
        <div className="flex-1 flex flex-col gap-4 overflow-auto">
          {/* Original Array */}
          {phase === "initial" || phase === "distributing" ? (
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
                        ${item.isDistributing ? "bg-yellow-500" : "bg-muted-foreground"}
                      `}
                      style={{ height: `${item.value * 1.5}px`, minHeight: "20px" }}
                      animate={{
                        scale: item.isDistributing ? 1.1 : 1,
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
          ) : null}

          {/* Buckets */}
          {buckets.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Buckets (0-19, 20-39, 40-59, 60-79, 80-99)</h3>
              <div className="grid grid-cols-5 gap-2">
                {buckets.map((bucket) => (
                  <div
                    key={bucket.index}
                    className="border rounded-lg p-2 min-h-[100px] bg-muted/30"
                  >
                    <div className="text-xs font-medium mb-2 text-center">
                      Bucket {bucket.index}
                    </div>
                    <div className="flex flex-col gap-1">
                      {bucket.items.map((item, idx) => (
                        <motion.div
                          key={`${item.id}-${idx}`}
                          className={`
                            text-xs p-1 rounded text-center font-mono
                            ${item.isSorting ? "bg-blue-500 text-white" :
                              item.isMerging ? "bg-green-600 text-white" :
                              "bg-primary/20"}
                          `}
                          animate={{
                            scale: item.isSorting || item.isMerging ? 1.05 : 1,
                          }}
                        >
                          {item.value}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sorted Array */}
          {(phase === "merging" || phase === "done") && array.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Sorted Array</h3>
              <div className="flex items-end gap-1 sm:gap-2 overflow-x-auto pb-2">
                {array.map((item, index) => (
                  <motion.div
                    key={item.id}
                    layout
                    className="w-8 sm:w-12 flex flex-col items-center gap-1"
                  >
                    <motion.div
                      className="w-full rounded-t-lg flex items-end justify-center bg-green-600"
                      style={{ height: `${item.value * 1.5}px`, minHeight: "20px" }}
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
