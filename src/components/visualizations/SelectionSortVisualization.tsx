"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Shuffle, Play, RotateCcw } from "lucide-react";

interface SelectionSortVisualizationProps {
  isPlaying: boolean;
  speed: number;
}

interface ArrayItem {
  id: number;
  value: number;
  isSelected?: boolean;
  isMinimum?: boolean;
  isSorted?: boolean;
  isComparing?: boolean;
}

export default function SelectionSortVisualization({ speed }: SelectionSortVisualizationProps) {
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
      setArray(prev => [...prev, newItem]);
      setInputValue("");
    }
  };

  const selectionSort = async () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    const arr = [...array];
    const n = arr.length;

    for (let i = 0; i < n - 1; i++) {
      // Mark current position as selected
      arr[i].isSelected = true;
      let minIdx = i;
      arr[minIdx].isMinimum = true;
      setArray([...arr]);
      await new Promise(resolve => setTimeout(resolve, 800 / speed));

      // Find minimum element in remaining array
      for (let j = i + 1; j < n; j++) {
        arr[j].isComparing = true;
        setArray([...arr]);
        await new Promise(resolve => setTimeout(resolve, 600 / speed));

        if (arr[j].value < arr[minIdx].value) {
          // New minimum found
          arr[minIdx].isMinimum = false;
          minIdx = j;
          arr[minIdx].isMinimum = true;
        }
        
        arr[j].isComparing = false;
        setArray([...arr]);
        await new Promise(resolve => setTimeout(resolve, 200 / speed));
      }

      // Swap if needed
      if (minIdx !== i) {
        await new Promise(resolve => setTimeout(resolve, 400 / speed));
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        setArray([...arr]);
        await new Promise(resolve => setTimeout(resolve, 600 / speed));
      }

      // Mark as sorted and reset flags
      arr[i].isSorted = true;
      arr[i].isSelected = false;
      if (minIdx < n) {
        arr[minIdx].isMinimum = false;
      }
      setArray([...arr]);
      await new Promise(resolve => setTimeout(resolve, 400 / speed));
    }
    
    // Mark last element as sorted
    if (n > 0) {
      arr[n - 1].isSorted = true;
      setArray([...arr]);
    }
    
    setIsAnimating(false);
  };

  const reset = () => {
    setArray(prev => prev.map(item => ({
      ...item,
      isSelected: false,
      isMinimum: false,
      isSorted: false,
      isComparing: false
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
        <h2 className="text-2xl font-bold mb-2 text-foreground">Selection Sort Visualization</h2>
        <p className="text-muted-foreground">
          Selection sort finds the minimum element and places it at the beginning, then repeats for the remaining array.
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
                onKeyPress={handleKeyPress}
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
            <Button onClick={selectionSort} disabled={isAnimating || array.length < 2}>
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
                <div className="w-3 h-3 bg-primary rounded"></div>
                <span className="text-muted-foreground font-medium">Selected Position</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-destructive rounded"></div>
                <span className="text-muted-foreground font-medium">Current Minimum</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span className="text-muted-foreground font-medium">Comparing</span>
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
                      item.isSelected ? 'bg-primary' :
                      item.isMinimum ? 'bg-destructive' :
                      item.isComparing ? 'bg-yellow-500' : 'bg-muted-foreground'}
                  `}
                  style={{ height: `${item.value * 3}px` }}
                  animate={{
                    scale: item.isSelected || item.isMinimum || item.isComparing ? 1.1 : 1,
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