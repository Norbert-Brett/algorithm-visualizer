"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Shuffle, Play, RotateCcw } from "lucide-react";

interface MergeSortVisualizationProps {
  isPlaying: boolean;
  speed: number;
}

interface ArrayItem {
  id: number;
  value: number;
  isComparing?: boolean;
  isMerging?: boolean;
  isSorted?: boolean;
  isInLeftSubarray?: boolean;
  isInRightSubarray?: boolean;
}

export default function MergeSortVisualization({ speed }: MergeSortVisualizationProps) {
  const [array, setArray] = useState<ArrayItem[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    generateRandomArray();
  }, []);

  const generateRandomArray = () => {
    const newArray: ArrayItem[] = [];
    for (let i = 0; i < 8; i++) {
      newArray.push({
        id: Date.now() + i, // Use timestamp + index for unique IDs
        value: Math.floor(Math.random() * 100) + 1,
      });
    }
    setArray(newArray);
  };

  const addElement = () => {
    const value = parseInt(inputValue);
    if (!isNaN(value) && value > 0 && value <= 100) {
      const newItem: ArrayItem = {
        id: Date.now() + Math.random(), // Ensure unique ID
        value: value,
      };
      setArray(prev => [...prev, newItem]);
      setInputValue("");
    }
  };

  const mergeSort = async () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    const arr = [...array];
    await mergeSortHelper(arr, 0, arr.length - 1);
    
    // Mark all as sorted
    arr.forEach(item => {
      item.isSorted = true;
      item.isComparing = false;
      item.isMerging = false;
      item.isInLeftSubarray = false;
      item.isInRightSubarray = false;
    });
    setArray([...arr]);
    setIsAnimating(false);
  };

  const mergeSortHelper = async (arr: ArrayItem[], left: number, right: number) => {
    if (left >= right) return;

    const mid = Math.floor((left + right) / 2);
    
    // Highlight left subarray
    for (let i = left; i <= mid; i++) {
      arr[i].isInLeftSubarray = true;
    }
    setArray([...arr]);
    await new Promise(resolve => setTimeout(resolve, 800 / speed));

    // Highlight right subarray
    for (let i = mid + 1; i <= right; i++) {
      arr[i].isInRightSubarray = true;
    }
    setArray([...arr]);
    await new Promise(resolve => setTimeout(resolve, 800 / speed));

    // Recursively sort left and right halves
    await mergeSortHelper(arr, left, mid);
    await mergeSortHelper(arr, mid + 1, right);
    
    // Merge the sorted halves
    await merge(arr, left, mid, right);
  };

  const merge = async (arr: ArrayItem[], left: number, mid: number, right: number) => {
    const leftArr = arr.slice(left, mid + 1);
    const rightArr = arr.slice(mid + 1, right + 1);
    
    let i = 0, j = 0, k = left;

    while (i < leftArr.length && j < rightArr.length) {
      // Highlight comparing elements
      if (k < arr.length) {
        arr[k].isComparing = true;
      }
      setArray([...arr]);
      await new Promise(resolve => setTimeout(resolve, 600 / speed));

      if (leftArr[i].value <= rightArr[j].value) {
        arr[k] = { ...leftArr[i] };
        arr[k].isMerging = true;
        i++;
      } else {
        arr[k] = { ...rightArr[j] };
        arr[k].isMerging = true;
        j++;
      }
      
      setArray([...arr]);
      await new Promise(resolve => setTimeout(resolve, 400 / speed));
      
      arr[k].isMerging = false;
      arr[k].isComparing = false;
      k++;
    }

    // Copy remaining elements
    while (i < leftArr.length) {
      arr[k] = { ...leftArr[i] };
      arr[k].isMerging = true;
      setArray([...arr]);
      await new Promise(resolve => setTimeout(resolve, 300 / speed));
      arr[k].isMerging = false;
      i++;
      k++;
    }

    while (j < rightArr.length) {
      arr[k] = { ...rightArr[j] };
      arr[k].isMerging = true;
      setArray([...arr]);
      await new Promise(resolve => setTimeout(resolve, 300 / speed));
      arr[k].isMerging = false;
      j++;
      k++;
    }

    // Clear subarray highlights
    for (let i = left; i <= right; i++) {
      arr[i].isInLeftSubarray = false;
      arr[i].isInRightSubarray = false;
    }
    setArray([...arr]);
    await new Promise(resolve => setTimeout(resolve, 400 / speed));
  };

  const reset = () => {
    setArray(prev => prev.map(item => ({
      ...item,
      isComparing: false,
      isMerging: false,
      isSorted: false,
      isInLeftSubarray: false,
      isInRightSubarray: false
    })));
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
        <h2 className="text-xl sm:text-2xl font-bold mb-2 text-foreground">Merge Sort Visualization</h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Merge sort divides the array into halves, recursively sorts them, and then merges the sorted halves.
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
                onKeyDown={handleKeyPress}
                placeholder="Enter number..."
                min="1"
                max="100"
              />
              <Button onClick={addElement} disabled={!inputValue || isAnimating}>
                Add
              </Button>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={mergeSort} disabled={isAnimating || array.length < 2}>
              <Play className="h-4 w-4 mr-2" />
              Sort
            </Button>
            <Button onClick={reset} variant="outline" disabled={isAnimating}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>

          <Button onClick={generateRandomArray} variant="outline" disabled={isAnimating}>
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
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-muted-foreground font-medium">Left Subarray</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded"></div>
                <span className="text-muted-foreground font-medium">Right Subarray</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span className="text-muted-foreground font-medium">Comparing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-destructive rounded"></div>
                <span className="text-muted-foreground font-medium">Merging</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-600 rounded"></div>
                <span className="text-muted-foreground font-medium">Sorted</span>
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
                    ${item.isSorted ? 'bg-green-600' : 
                      item.isMerging ? 'bg-destructive' :
                      item.isComparing ? 'bg-yellow-500' :
                      item.isInLeftSubarray ? 'bg-blue-500' :
                      item.isInRightSubarray ? 'bg-purple-500' : 'bg-muted-foreground'}
                  `}
                  style={{ height: `${item.value * 2}px`, minHeight: '20px' }}
                  animate={{
                    scale: item.isComparing || item.isMerging ? 1.1 : 1,
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