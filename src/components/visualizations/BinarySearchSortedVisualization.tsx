"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, RotateCcw, Shuffle } from "lucide-react";

interface BinarySearchSortedVisualizationProps {
  speed: number;
}

interface ArrayElement {
  value: number;
  index: number;
  isLow: boolean;
  isHigh: boolean;
  isMid: boolean;
  isFound: boolean;
  isEliminated: boolean;
}

export default function BinarySearchSortedVisualization({ speed }: BinarySearchSortedVisualizationProps) {
  const [array, setArray] = useState<ArrayElement[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [low, setLow] = useState(-1);
  const [high, setHigh] = useState(-1);
  const [mid, setMid] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState("");
  const [comparisons, setComparisons] = useState(0);
  const [searchSteps, setSearchSteps] = useState<string[]>([]);

  // Initialize sorted array
  const initializeArray = useCallback(() => {
    const newArray: ArrayElement[] = [];
    const sortedValues = Array.from({length: 16}, (_, i) => (i + 1) * 5); // [5, 10, 15, ..., 80]
    
    for (let i = 0; i < sortedValues.length; i++) {
      newArray.push({
        value: sortedValues[i],
        index: i,
        isLow: false,
        isHigh: false,
        isMid: false,
        isFound: false,
        isEliminated: false,
      });
    }
    setArray(newArray);
    setLow(-1);
    setHigh(-1);
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
      isLow: false,
      isHigh: false,
      isMid: false,
      isFound: false,
      isEliminated: false,
    }));
    setArray(currentArray);

    let lowIdx = 0;
    let highIdx = currentArray.length - 1;
    let compCount = 0;
    const steps: string[] = [];

    steps.push(`🔍 Searching for ${target} in sorted array`);
    steps.push(`Initial search space: [${lowIdx}, ${highIdx}]`);
    setSearchSteps([...steps]);

    while (lowIdx <= highIdx) {
      const midIdx = Math.floor((lowIdx + highIdx) / 2);
      compCount++;
      
      setLow(lowIdx);
      setHigh(highIdx);
      setMid(midIdx);
      setComparisons(compCount);

      // Update array visualization
      setArray(prev => prev.map((item, idx) => ({
        ...item,
        isLow: idx === lowIdx,
        isHigh: idx === highIdx,
        isMid: idx === midIdx,
        isEliminated: idx < lowIdx || idx > highIdx,
      })));

      const midValue = currentArray[midIdx].value;
      steps.push(`\nStep ${compCount}:`);
      steps.push(`  Low=${lowIdx}, Mid=${midIdx}, High=${highIdx}`);
      steps.push(`  Compare: ${target} vs ${midValue}`);
      setSearchSteps([...steps]);

      // Wait for animation
      await new Promise(resolve => setTimeout(resolve, Math.max(500, 1500 / speed)));

      if (midValue === target) {
        // Found the target
        setArray(prev => prev.map((item, idx) => ({
          ...item,
          isLow: false,
          isHigh: false,
          isMid: false,
          isFound: idx === midIdx,
        })));
        steps.push(`  ✅ Match! Found ${target} at index ${midIdx}`);
        setSearchSteps([...steps]);
        setSearchResult(`Found ${target} at index ${midIdx}!`);
        setIsSearching(false);
        return;
      } else if (midValue < target) {
        // Target is in the right half
        steps.push(`  ${midValue} < ${target} → Search right half`);
        steps.push(`  New search space: [${midIdx + 1}, ${highIdx}]`);
        lowIdx = midIdx + 1;
      } else {
        // Target is in the left half
        steps.push(`  ${midValue} > ${target} → Search left half`);
        steps.push(`  New search space: [${lowIdx}, ${midIdx - 1}]`);
        highIdx = midIdx - 1;
      }
      
      setSearchSteps([...steps]);
      
      // Show elimination
      await new Promise(resolve => setTimeout(resolve, Math.max(300, 800 / speed)));
    }

    // Not found
    setArray(prev => prev.map(item => ({
      ...item,
      isLow: false,
      isHigh: false,
      isMid: false,
      isEliminated: true,
    })));
    steps.push(`\n❌ Search space exhausted`);
    steps.push(`${target} not found in array`);
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
    const values = Array.from({length: 16}, () => Math.floor(Math.random() * 100) + 1);
    values.sort((a, b) => a - b);
    
    const newArray = values.map((value, index) => ({
      value,
      index,
      isLow: false,
      isHigh: false,
      isMid: false,
      isFound: false,
      isEliminated: false,
    }));
    
    setArray(newArray);
    setLow(-1);
    setHigh(-1);
    setMid(-1);
    setSearchResult("");
    setComparisons(0);
    setSearchSteps([]);
  };

  return (
    <div className="h-full flex flex-col p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Binary Search (Sorted)</h2>
        <p className="text-muted-foreground">
          Efficient O(log n) search algorithm on sorted arrays using low, mid, and high pointers to reduce search space by half each iteration.
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

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Array Visualization */}
        <div className="flex-1 flex flex-col items-center justify-center overflow-y-auto">
          <div className="flex gap-1 mb-4 flex-wrap justify-center max-w-4xl">
            {array.map((element, index) => (
              <motion.div
                key={index}
                className={`
                  w-12 h-12 flex items-center justify-center rounded border-2 font-bold text-sm
                  ${element.isFound 
                    ? 'bg-green-500 border-green-600 text-white shadow-lg' 
                    : element.isMid 
                    ? 'bg-purple-500 border-purple-600 text-white shadow-md' 
                    : element.isLow 
                    ? 'bg-blue-500 border-blue-600 text-white' 
                    : element.isHigh 
                    ? 'bg-orange-500 border-orange-600 text-white' 
                    : element.isEliminated 
                    ? 'bg-gray-200 border-gray-300 text-gray-500' 
                    : 'bg-blue-50 border-blue-200 text-blue-900'
                  }
                `}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: element.isMid ? 1.2 : element.isLow || element.isHigh ? 1.1 : 1, 
                  opacity: element.isEliminated ? 0.3 : 1,
                  y: element.isMid ? -10 : element.isLow || element.isHigh ? -5 : 0,
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
                  ${low === index || high === index || mid === index 
                    ? 'text-purple-700 font-bold' 
                    : 'text-muted-foreground'
                  }
                `}
              >
                {index}
              </div>
            ))}
          </div>

          {/* Pointers */}
          {(low !== -1 || high !== -1 || mid !== -1) && (
            <div className="flex gap-6 mb-4 text-sm flex-wrap justify-center">
              {low !== -1 && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="font-medium">Low: {low} (value: {array[low]?.value})</span>
                </div>
              )}
              {mid !== -1 && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-purple-500 rounded"></div>
                  <span className="font-medium">Mid: {mid} (value: {array[mid]?.value})</span>
                </div>
              )}
              {high !== -1 && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-500 rounded"></div>
                  <span className="font-medium">High: {high} (value: {array[high]?.value})</span>
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
              Comparisons: {comparisons} | Time Complexity: O(log n)
            </div>
          </div>
        </div>

        {/* Search Steps */}
        <div className="w-80 bg-muted/50 rounded-lg p-4 overflow-y-auto">
          <h3 className="font-medium mb-3">Search Path:</h3>
          <div className="space-y-1 text-xs font-mono">
            {searchSteps.map((step, index) => (
              <div 
                key={index} 
                className={`p-1.5 rounded whitespace-pre-wrap ${
                  step.includes('✅') ? 'bg-green-100 text-green-900 font-bold' :
                  step.includes('❌') ? 'bg-red-100 text-red-900 font-bold' :
                  step.includes('Step') ? 'bg-blue-100 text-blue-900 font-semibold mt-2' :
                  step.includes('🔍') ? 'bg-purple-100 text-purple-900 font-semibold' :
                  step.includes('→') ? 'text-orange-700' :
                  'text-gray-700'
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
            <div className="w-4 h-4 bg-blue-50 border border-blue-200 rounded"></div>
            <span>Active search space</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span>Low pointer</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <span>Mid pointer (comparing)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span>High pointer</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
            <span>Eliminated from search</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Target found</span>
          </div>
        </div>
      </div>
    </div>
  );
}
