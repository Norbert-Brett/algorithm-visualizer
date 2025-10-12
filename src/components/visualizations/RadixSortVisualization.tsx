"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Shuffle, Play, RotateCcw } from "lucide-react";

interface RadixSortVisualizationProps {
  isPlaying: boolean;
  speed: number;
}

interface ArrayItem {
  id: number;
  value: number;
  isProcessing?: boolean;
  currentDigit?: number;
  bucketIndex?: number;
  isSorted?: boolean;
}

export default function RadixSortVisualization({ speed }: RadixSortVisualizationProps) {
  const [array, setArray] = useState<ArrayItem[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [currentDigitPosition, setCurrentDigitPosition] = useState(0);
  const [buckets, setBuckets] = useState<ArrayItem[][]>([]);

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
    setBuckets([]);
    setCurrentDigitPosition(0);
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

  const getDigit = (num: number, position: number): number => {
    return Math.floor(num / Math.pow(10, position)) % 10;
  };

  const getMaxDigits = (arr: ArrayItem[]): number => {
    const maxNum = Math.max(...arr.map(item => item.value));
    return maxNum.toString().length;
  };

  const radixSort = async () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    const arr = [...array];
    const maxDigits = getMaxDigits(arr);

    for (let digitPos = 0; digitPos < maxDigits; digitPos++) {
      setCurrentDigitPosition(digitPos);
      
      // Initialize buckets (0-9)
      const newBuckets: ArrayItem[][] = Array.from({ length: 10 }, () => []);
      
      // Distribute elements into buckets based on current digit
      for (let i = 0; i < arr.length; i++) {
        const digit = getDigit(arr[i].value, digitPos);
        arr[i].isProcessing = true;
        arr[i].currentDigit = digit;
        arr[i].bucketIndex = digit;
        
        setArray([...arr]);
        await new Promise(resolve => setTimeout(resolve, 600 / speed));
        
        newBuckets[digit].push({ ...arr[i] });
        arr[i].isProcessing = false;
      }
      
      setBuckets([...newBuckets]);
      await new Promise(resolve => setTimeout(resolve, 800 / speed));
      
      // Collect elements back from buckets
      let index = 0;
      for (let bucket = 0; bucket < 10; bucket++) {
        for (const item of newBuckets[bucket]) {
          item.isProcessing = true;
          arr[index] = { ...item };
          setArray([...arr]);
          await new Promise(resolve => setTimeout(resolve, 400 / speed));
          
          arr[index].isProcessing = false;
          arr[index].currentDigit = undefined;
          arr[index].bucketIndex = undefined;
          index++;
        }
      }
      
      setArray([...arr]);
      setBuckets([]);
      await new Promise(resolve => setTimeout(resolve, 600 / speed));
    }

    // Mark all as sorted
    arr.forEach(item => {
      item.isSorted = true;
    });
    setArray([...arr]);
    setCurrentDigitPosition(0);
    setIsAnimating(false);
  };

  const reset = () => {
    setArray(prev => prev.map(item => ({
      ...item,
      isProcessing: false,
      currentDigit: undefined,
      bucketIndex: undefined,
      isSorted: false
    })));
    setBuckets([]);
    setCurrentDigitPosition(0);
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
        <h2 className="text-2xl font-bold mb-2 text-foreground">Radix Sort Visualization</h2>
        <p className="text-muted-foreground">
          Radix sort processes digits from least to most significant, distributing elements into buckets.
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
            <Button onClick={radixSort} disabled={isAnimating || array.length < 2}>
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
              {isAnimating && (
                <div className="flex items-center justify-between">
                  <span>Current Digit:</span>
                  <Badge variant="default">{currentDigitPosition + 1}</Badge>
                </div>
              )}
            </div>
            
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-muted-foreground font-medium">Processing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-600 rounded"></div>
                <span className="text-muted-foreground font-medium">Sorted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-muted-foreground rounded"></div>
                <span className="text-muted-foreground font-medium">Unsorted</span>
              </div>
            </div>
          </div>

          {/* Buckets Display */}
          {buckets.length > 0 && (
            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-2">Buckets (Digit {currentDigitPosition + 1})</h4>
              <div className="space-y-1 text-xs">
                {buckets.map((bucket, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="w-4 text-muted-foreground">{index}:</span>
                    <div className="flex gap-1">
                      {bucket.map((item) => (
                        <Badge key={item.id} variant="outline" className="text-xs">
                          {item.value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
                      item.isProcessing ? 'bg-blue-500' : 'bg-muted-foreground'}
                  `}
                  style={{ height: `${item.value * 3}px` }}
                  animate={{
                    scale: item.isProcessing ? 1.1 : 1,
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
                {item.currentDigit !== undefined && (
                  <div className="text-xs text-blue-600 font-bold">
                    D: {item.currentDigit}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}