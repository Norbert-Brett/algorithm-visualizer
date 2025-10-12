"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RotateCcw, Search, Shuffle } from "lucide-react";

interface LinearSearchVisualizationProps {
  speed: number;
}

interface ArrayElement {
  value: number;
  index: number;
  isComparing: boolean;
  isFound: boolean;
  isChecked: boolean;
}

export default function LinearSearchVisualization({ speed }: LinearSearchVisualizationProps) {
  const [array, setArray] = useState<ArrayElement[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState("");
  const [comparisons, setComparisons] = useState(0);

  // Initialize array
  const initializeArray = useCallback(() => {
    const newArray: ArrayElement[] = [];
    for (let i = 0; i < 10; i++) {
      newArray.push({
        value: Math.floor(Math.random() * 100) + 1,
        index: i,
        isComparing: false,
        isFound: false,
        isChecked: false,
      });
    }
    setArray(newArray);
    setCurrentIndex(-1);
    setSearchResult("");
    setComparisons(0);
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeArray();
  }, [initializeArray]);

  // Linear search algorithm
  const linearSearch = useCallback(async (target: number) => {
    if (!array.length) return;

    setIsSearching(true);
    setSearchResult("");
    setComparisons(0);
    setCurrentIndex(-1);

    // Reset array state and get current array values
    const currentArray = array.map(item => ({
      ...item,
      isComparing: false,
      isFound: false,
      isChecked: false,
    }));
    setArray(currentArray);

    let compCount = 0;

    for (let i = 0; i < currentArray.length; i++) {
      setCurrentIndex(i);
      compCount++;
      setComparisons(compCount);

      // Highlight current element being compared
      setArray(prev => prev.map((item, idx) => ({
        ...item,
        isComparing: idx === i,
        isChecked: idx < i,
      })));

      // Wait for animation
      await new Promise(resolve => setTimeout(resolve, Math.max(300, 1000 / speed)));

      if (currentArray[i].value === target) {
        // Found the target
        setArray(prev => prev.map((item, idx) => ({
          ...item,
          isComparing: false,
          isFound: idx === i,
          isChecked: idx <= i,
        })));
        setSearchResult(`Found ${target} at index ${i}!`);
        setIsSearching(false);
        return;
      }
    }

    // Not found
    setArray(prev => prev.map(item => ({
      ...item,
      isComparing: false,
      isChecked: true,
    })));
    setSearchResult(`${target} not found in array`);
    setIsSearching(false);
  }, [array, speed]);

  const handleSearch = () => {
    const target = parseInt(searchValue);
    if (!isNaN(target)) {
      linearSearch(target);
    }
  };

  const shuffleArray = () => {
    if (isSearching) return;
    
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i].value, shuffled[j].value] = [shuffled[j].value, shuffled[i].value];
    }
    
    setArray(shuffled.map(item => ({
      ...item,
      isComparing: false,
      isFound: false,
      isChecked: false,
    })));
    setSearchResult("");
    setComparisons(0);
    setCurrentIndex(-1);
  };

  return (
    <div className="h-full flex flex-col p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Linear Search</h2>
        <p className="text-muted-foreground">
          Sequential search through each element until the target is found or the end is reached.
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
          <Button onClick={shuffleArray} disabled={isSearching} variant="outline">
            <Shuffle className="h-4 w-4 mr-2" />
            Shuffle
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

      {/* Array Visualization */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="flex gap-2 mb-8 flex-wrap justify-center">
          {array.map((element, index) => (
            <motion.div
              key={index}
              className={`
                w-16 h-16 flex items-center justify-center rounded-lg border-2 font-bold text-lg
                ${element.isFound 
                  ? 'bg-green-500 border-green-600 text-white' 
                  : element.isComparing 
                  ? 'bg-yellow-400 border-yellow-500 text-black' 
                  : element.isChecked 
                  ? 'bg-red-200 border-red-300 text-red-800' 
                  : 'bg-blue-100 border-blue-300 text-blue-800'
                }
              `}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: element.isComparing ? 1.1 : 1, 
                opacity: 1,
                y: element.isComparing ? -5 : 0,
              }}
              transition={{ duration: 0.3 }}
            >
              {element.value}
            </motion.div>
          ))}
        </div>

        {/* Index indicators */}
        <div className="flex gap-2 mb-4 flex-wrap justify-center">
          {array.map((_, index) => (
            <div
              key={index}
              className={`
                w-16 h-6 flex items-center justify-center text-sm font-medium
                ${currentIndex === index ? 'text-yellow-600' : 'text-muted-foreground'}
              `}
            >
              {index}
            </div>
          ))}
        </div>

        {/* Status */}
        <div className="text-center space-y-2">
          {isSearching && (
            <div className="text-lg font-medium text-blue-600">
              Searching... Current index: {currentIndex}
            </div>
          )}
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

      {/* Legend */}
      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <div className="text-sm font-medium mb-2">Legend:</div>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
            <span>Unvisited</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-400 border border-yellow-500 rounded"></div>
            <span>Currently comparing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-200 border border-red-300 rounded"></div>
            <span>Already checked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 border border-green-600 rounded"></div>
            <span>Found target</span>
          </div>
        </div>
      </div>
    </div>
  );
}