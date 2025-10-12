"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, RotateCcw, Shuffle } from "lucide-react";

interface BinarySearchVisualizationProps {
  isPlaying: boolean;
  speed: number;
}

interface ArrayElement {
  value: number;
  index: number;
  isLeft: boolean;
  isRight: boolean;
  isMid: boolean;
  isFound: boolean;
  isEliminated: boolean;
}

export default function BinarySearchVisualization({ speed }: BinarySearchVisualizationProps) {
  const [array, setArray] = useState<ArrayElement[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [left, setLeft] = useState(-1);
  const [right, setRight] = useState(-1);
  const [mid, setMid] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState("");
  const [comparisons, setComparisons] = useState(0);
  const [searchSteps, setSearchSteps] = useState<string[]>([]);

  // Initialize sorted array
  const initializeArray = useCallback(() => {
    const newArray: ArrayElement[] = [];
    const sortedValues = Array.from({length: 15}, (_, i) => (i + 1) * 5); // [5, 10, 15, ..., 75]
    
    for (let i = 0; i < sortedValues.length; i++) {
      newArray.push({
        value: sortedValues[i],
        index: i,
        isLeft: false,
        isRight: false,
        isMid: false,
        isFound: false,
        isEliminated: false,
      });
    }
    setArray(newArray);
    setLeft(-1);
    setRight(-1);
    setMid(-1);
    setSearchResult("");
    setComparisons(0);
    setSearchSteps([]);
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeArray();
  }, [initializeArray]);

  // Binary search algorithm
  const binarySearch = useCallback(async (target: number) => {
    if (!array.length) return;

    setIsSearching(true);
    setSearchResult("");
    setComparisons(0);
    setSearchSteps([]);

    // Reset array state and get current array values
    const currentArray = array.map(item => ({
      ...item,
      isLeft: false,
      isRight: false,
      isMid: false,
      isFound: false,
      isEliminated: false,
    }));
    setArray(currentArray);

    let leftIdx = 0;
    let rightIdx = currentArray.length - 1;
    let compCount = 0;
    const steps: string[] = [];

    while (leftIdx <= rightIdx) {
      const midIdx = Math.floor((leftIdx + rightIdx) / 2);
      compCount++;
      
      setLeft(leftIdx);
      setRight(rightIdx);
      setMid(midIdx);
      setComparisons(compCount);

      // Update array visualization
      setArray(prev => prev.map((item, idx) => ({
        ...item,
        isLeft: idx === leftIdx,
        isRight: idx === rightIdx,
        isMid: idx === midIdx,
        isEliminated: idx < leftIdx || idx > rightIdx,
      })));

      const midValue = currentArray[midIdx].value;
      steps.push(`Step ${compCount}: Compare ${target} with ${midValue} at index ${midIdx}`);
      setSearchSteps([...steps]);

      // Wait for animation
      await new Promise(resolve => setTimeout(resolve, Math.max(500, 1500 / speed)));

      if (midValue === target) {
        // Found the target
        setArray(prev => prev.map((item, idx) => ({
          ...item,
          isLeft: false,
          isRight: false,
          isMid: false,
          isFound: idx === midIdx,
        })));
        steps.push(`✅ Found ${target} at index ${midIdx}!`);
        setSearchSteps([...steps]);
        setSearchResult(`Found ${target} at index ${midIdx}!`);
        setIsSearching(false);
        return;
      } else if (midValue < target) {
        // Target is in the right half
        steps.push(`${midValue} < ${target}, search right half`);
        leftIdx = midIdx + 1;
      } else {
        // Target is in the left half
        steps.push(`${midValue} > ${target}, search left half`);
        rightIdx = midIdx - 1;
      }
      
      setSearchSteps([...steps]);
      
      // Show elimination
      await new Promise(resolve => setTimeout(resolve, Math.max(300, 800 / speed)));
    }

    // Not found
    setArray(prev => prev.map(item => ({
      ...item,
      isLeft: false,
      isRight: false,
      isMid: false,
      isEliminated: true,
    })));
    steps.push(`❌ ${target} not found in array`);
    setSearchSteps([...steps]);
    setSearchResult(`${target} not found in array`);
    setIsSearching(false);
  }, [array, speed]);

  const handleSearch = () => {
    const target = parseInt(searchValue);
    if (!isNaN(target)) {
      binarySearch(target);
    }
  };

  const shuffleAndSort = () => {
    if (isSearching) return;
    
    // Generate new random sorted array
    const values = Array.from({length: 15}, () => Math.floor(Math.random() * 100) + 1);
    values.sort((a, b) => a - b);
    
    const newArray = values.map((value, index) => ({
      value,
      index,
      isLeft: false,
      isRight: false,
      isMid: false,
      isFound: false,
      isEliminated: false,
    }));
    
    setArray(newArray);
    setLeft(-1);
    setRight(-1);
    setMid(-1);
    setSearchResult("");
    setComparisons(0);
    setSearchSteps([]);
  };

  return (
    <div className="h-full flex flex-col p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Binary Search</h2>
        <p className="text-muted-foreground">
          Efficient search algorithm that works on sorted arrays by repeatedly dividing the search space in half.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex gap-2">
          <Input
            type="number"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Enter number to search..."
            className="w-48"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button 
            onClick={handleSearch} 
            disabled={!searchValue.trim() || isSearching || !array.length}
          >
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={shuffleAndSort} disabled={isSearching} variant="outline">
            <Shuffle className="h-4 w-4 mr-2" />
            New Array
          </Button>
          <Button onClick={initializeArray} disabled={isSearching} variant="outline">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button 
            onClick={() => {
              if (array.length > 0) {
                const randomElement = array[Math.floor(Math.random() * array.length)];
                setSearchValue(randomElement.value.toString());
              }
            }} 
            disabled={isSearching || !array.length} 
            variant="outline"
          >
            Demo
          </Button>
        </div>
      </div>

      <div className="flex-1 flex gap-6">
        {/* Array Visualization */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="flex gap-1 mb-4 flex-wrap justify-center max-w-4xl">
            {array.map((element, index) => (
              <motion.div
                key={index}
                className={`
                  w-12 h-12 flex items-center justify-center rounded border-2 font-bold text-sm
                  ${element.isFound 
                    ? 'bg-green-500 border-green-600 text-white' 
                    : element.isMid 
                    ? 'bg-purple-500 border-purple-600 text-white' 
                    : element.isLeft 
                    ? 'bg-blue-500 border-blue-600 text-white' 
                    : element.isRight 
                    ? 'bg-red-500 border-red-600 text-white' 
                    : element.isEliminated 
                    ? 'bg-gray-300 border-gray-400 text-gray-600' 
                    : 'bg-blue-100 border-blue-300 text-blue-800'
                  }
                `}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: element.isMid ? 1.2 : element.isLeft || element.isRight ? 1.1 : 1, 
                  opacity: element.isEliminated ? 0.4 : 1,
                  y: element.isMid ? -8 : element.isLeft || element.isRight ? -4 : 0,
                }}
                transition={{ duration: 0.3 }}
              >
                {element.value}
              </motion.div>
            ))}
          </div>

          {/* Index indicators */}
          <div className="flex gap-1 mb-6 flex-wrap justify-center max-w-4xl">
            {array.map((_, index) => (
              <div
                key={index}
                className={`
                  w-12 h-6 flex items-center justify-center text-xs font-medium
                  ${left === index || right === index || mid === index 
                    ? 'text-purple-600 font-bold' 
                    : 'text-muted-foreground'
                  }
                `}
              >
                {index}
              </div>
            ))}
          </div>

          {/* Pointers */}
          {(left !== -1 || right !== -1 || mid !== -1) && (
            <div className="flex gap-6 mb-4 text-sm">
              {left !== -1 && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span>Left: {left}</span>
                </div>
              )}
              {mid !== -1 && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-purple-500 rounded"></div>
                  <span>Mid: {mid}</span>
                </div>
              )}
              {right !== -1 && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span>Right: {right}</span>
                </div>
              )}
            </div>
          )}

          {/* Status */}
          <div className="text-center space-y-2">
            {searchResult && (
              <div className={`text-lg font-medium ${
                searchResult.includes('Found') ? 'text-green-600' : 'text-red-600'
              }`}>
                {searchResult}
              </div>
            )}
            <div className="text-sm text-muted-foreground">
              Comparisons: {comparisons}
            </div>
          </div>
        </div>

        {/* Search Steps */}
        <div className="w-80 bg-muted/50 rounded-lg p-4">
          <h3 className="font-medium mb-3">Search Steps:</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {searchSteps.map((step, index) => (
              <div 
                key={index} 
                className={`text-sm p-2 rounded ${
                  step.includes('✅') ? 'bg-green-100 text-green-800' :
                  step.includes('❌') ? 'bg-red-100 text-red-800' :
                  'bg-blue-50 text-blue-800'
                }`}
              >
                {step}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <div className="text-sm font-medium mb-2">Legend:</div>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
            <span>Active range</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span>Left pointer</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <span>Mid pointer</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Right pointer</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-300 rounded"></div>
            <span>Eliminated</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Found target</span>
          </div>
        </div>
      </div>
    </div>
  );
}