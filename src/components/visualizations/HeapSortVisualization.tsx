"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Shuffle, Play, RotateCcw } from "lucide-react";

interface HeapSortVisualizationProps {
  isPlaying: boolean;
  speed: number;
}

interface ArrayItem {
  id: number;
  value: number;
  isComparing?: boolean;
  isSwapping?: boolean;
  isSorted?: boolean;
  isHeapRoot?: boolean;
  isHeapifying?: boolean;
}

export default function HeapSortVisualization({ speed }: HeapSortVisualizationProps) {
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

  const heapSort = async () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    const arr = [...array];
    const n = arr.length;

    // Build max heap
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      await heapify(arr, n, i);
    }

    // Extract elements from heap one by one
    for (let i = n - 1; i > 0; i--) {
      // Move current root to end (swap)
      arr[0].isHeapRoot = true;
      arr[i].isSwapping = true;
      setArray([...arr]);
      await new Promise(resolve => setTimeout(resolve, 600 / speed));

      [arr[0], arr[i]] = [arr[i], arr[0]];
      arr[0].isHeapRoot = false;
      arr[i].isSwapping = false;
      arr[i].isSorted = true;
      setArray([...arr]);
      await new Promise(resolve => setTimeout(resolve, 400 / speed));

      // Call heapify on the reduced heap
      await heapify(arr, i, 0);
    }

    // Mark first element as sorted
    arr[0].isSorted = true;
    setArray([...arr]);
    setIsAnimating(false);
  };

  const heapify = async (arr: ArrayItem[], n: number, i: number) => {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    // Highlight current node being heapified
    arr[i].isHeapifying = true;
    setArray([...arr]);
    await new Promise(resolve => setTimeout(resolve, 400 / speed));

    // Compare with left child
    if (left < n) {
      arr[left].isComparing = true;
      setArray([...arr]);
      await new Promise(resolve => setTimeout(resolve, 400 / speed));
      
      if (arr[left].value > arr[largest].value) {
        largest = left;
      }
      arr[left].isComparing = false;
    }

    // Compare with right child
    if (right < n) {
      arr[right].isComparing = true;
      setArray([...arr]);
      await new Promise(resolve => setTimeout(resolve, 400 / speed));
      
      if (arr[right].value > arr[largest].value) {
        largest = right;
      }
      arr[right].isComparing = false;
    }

    // If largest is not root, swap and continue heapifying
    if (largest !== i) {
      arr[i].isSwapping = true;
      arr[largest].isSwapping = true;
      setArray([...arr]);
      await new Promise(resolve => setTimeout(resolve, 500 / speed));

      [arr[i], arr[largest]] = [arr[largest], arr[i]];
      arr[i].isSwapping = false;
      arr[largest].isSwapping = false;
      setArray([...arr]);
      await new Promise(resolve => setTimeout(resolve, 300 / speed));

      // Recursively heapify the affected sub-tree
      await heapify(arr, n, largest);
    }

    arr[i].isHeapifying = false;
    setArray([...arr]);
  };

  const reset = () => {
    setArray(prev => prev.map(item => ({
      ...item,
      isComparing: false,
      isSwapping: false,
      isSorted: false,
      isHeapRoot: false,
      isHeapifying: false
    })));
    setIsAnimating(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addElement();
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 text-foreground">Heap Sort Visualization</h2>
        <p className="text-muted-foreground">
          Heap sort builds a max heap from the array, then repeatedly extracts the maximum element.
        </p>
      </div>

      <div className="flex gap-6 flex-1">
        {/* Controls */}
        <div className="w-80 space-y-4">
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
            <Button onClick={heapSort} disabled={isAnimating || array.length < 2}>
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
                <div className="w-3 h-3 bg-orange-500 rounded"></div>
                <span className="text-muted-foreground font-medium">Heap Root</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-muted-foreground font-medium">Heapifying</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span className="text-muted-foreground font-medium">Comparing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-destructive rounded"></div>
                <span className="text-muted-foreground font-medium">Swapping</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-600 rounded"></div>
                <span className="text-muted-foreground font-medium">Sorted</span>
              </div>
            </div>
          </div>
        </div>

        {/* Visualization */}
        <div className="flex-1 flex items-end justify-center pb-20">
          <div className="flex items-end gap-2">
            {array.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                className="w-12 flex flex-col items-center gap-2"
              >
                <motion.div
                  className={`
                    w-full rounded-t-lg flex items-end justify-center
                    transition-colors duration-300
                    ${item.isSorted ? 'bg-green-600' : 
                      item.isSwapping ? 'bg-destructive' :
                      item.isHeapRoot ? 'bg-orange-500' :
                      item.isHeapifying ? 'bg-blue-500' :
                      item.isComparing ? 'bg-yellow-500' : 'bg-muted-foreground'}
                  `}
                  style={{ height: `${item.value * 3}px` }}
                  animate={{
                    scale: item.isComparing || item.isSwapping || item.isHeapRoot || item.isHeapifying ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="text-white text-xs font-mono mb-1">
                    {item.value}
                  </span>
                </motion.div>
                <div className="text-xs text-muted-foreground font-mono font-medium">
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