"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Trash2, RotateCcw, Shuffle } from "lucide-react";

interface OpenHashTableVisualizationProps {
  speed: number;
}

interface HashNode {
  key: string;
  value: number;
  id: string;
}

interface HashBucket {
  index: number;
  nodes: HashNode[];
  isActive: boolean;
  isHighlighted: boolean;
}

interface HashTableState {
  buckets: HashBucket[];
  size: number;
  operations: string[];
  currentOperation: string;
}

export default function OpenHashTableVisualization({ speed }: OpenHashTableVisualizationProps) {
  const [hashTable, setHashTable] = useState<HashTableState>({
    buckets: [],
    size: 7, // Prime number for better distribution
    operations: [],
    currentOperation: ""
  });
  const [inputKey, setInputKey] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [searchKey, setSearchKey] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [stats, setStats] = useState({
    totalElements: 0,
    loadFactor: 0,
    collisions: 0,
    maxChainLength: 0
  });

  // Simple hash function (djb2)
  const hashFunction = useCallback((key: string, tableSize: number): number => {
    let hash = 5381;
    for (let i = 0; i < key.length; i++) {
      hash = ((hash << 5) + hash) + key.charCodeAt(i);
    }
    return Math.abs(hash) % tableSize;
  }, []);

  // Initialize hash table
  const initializeHashTable = useCallback(() => {
    const buckets: HashBucket[] = [];
    for (let i = 0; i < hashTable.size; i++) {
      buckets.push({
        index: i,
        nodes: [],
        isActive: false,
        isHighlighted: false
      });
    }
    
    setHashTable(prev => ({
      ...prev,
      buckets,
      operations: [],
      currentOperation: ""
    }));
    
    setStats({
      totalElements: 0,
      loadFactor: 0,
      collisions: 0,
      maxChainLength: 0
    });
  }, [hashTable.size]);

  // Initialize on mount
  useEffect(() => {
    initializeHashTable();
  }, [initializeHashTable]);

  // Update statistics
  const updateStats = useCallback((buckets: HashBucket[]) => {
    const totalElements = buckets.reduce((sum, bucket) => sum + bucket.nodes.length, 0);
    const loadFactor = totalElements / buckets.length;
    const chainLengths = buckets.map(bucket => bucket.nodes.length);
    const maxChainLength = Math.max(...chainLengths, 0);
    const collisions = chainLengths.filter(length => length > 1).length;
    
    setStats({
      totalElements,
      loadFactor: Math.round(loadFactor * 100) / 100,
      collisions,
      maxChainLength
    });
  }, []);

  // Insert operation
  const insert = useCallback(async (key: string, value: number) => {
    if (!key.trim()) return;
    
    setIsAnimating(true);
    const hashIndex = hashFunction(key, hashTable.size);
    
    // Highlight the target bucket
    setHashTable(prev => ({
      ...prev,
      buckets: prev.buckets.map(bucket => ({
        ...bucket,
        isActive: bucket.index === hashIndex,
        isHighlighted: false
      })),
      currentOperation: `Inserting key "${key}" with value ${value}`,
      operations: [...prev.operations, `Hash("${key}") = ${hashIndex}`]
    }));

    await new Promise(resolve => setTimeout(resolve, Math.max(500, 1000 / speed)));

    // Check if key already exists
    const existingNodeIndex = hashTable.buckets[hashIndex].nodes.findIndex(node => node.key === key);
    
    setHashTable(prev => {
      const newBuckets = [...prev.buckets];
      const targetBucket = { ...newBuckets[hashIndex] };
      
      if (existingNodeIndex !== -1) {
        // Update existing key
        targetBucket.nodes = [...targetBucket.nodes];
        targetBucket.nodes[existingNodeIndex] = {
          ...targetBucket.nodes[existingNodeIndex],
          value
        };
        newBuckets[hashIndex] = targetBucket;
        
        return {
          ...prev,
          buckets: newBuckets,
          operations: [...prev.operations, `Updated existing key "${key}" with new value ${value}`]
        };
      } else {
        // Insert new key-value pair
        const newNode: HashNode = {
          key,
          value,
          id: `${key}-${Date.now()}`
        };
        
        targetBucket.nodes = [...targetBucket.nodes, newNode];
        targetBucket.isHighlighted = true;
        newBuckets[hashIndex] = targetBucket;
        
        return {
          ...prev,
          buckets: newBuckets,
          operations: [...prev.operations, 
            targetBucket.nodes.length > 1 
              ? `Collision! Added "${key}" to chain at index ${hashIndex}`
              : `Added "${key}" to empty bucket ${hashIndex}`
          ]
        };
      }
    });

    await new Promise(resolve => setTimeout(resolve, Math.max(500, 1000 / speed)));

    // Reset highlighting
    setHashTable(prev => ({
      ...prev,
      buckets: prev.buckets.map(bucket => ({
        ...bucket,
        isActive: false,
        isHighlighted: false
      })),
      currentOperation: ""
    }));

    // Update stats
    updateStats(hashTable.buckets);
    setIsAnimating(false);
  }, [hashFunction, hashTable.size, hashTable.buckets, speed, updateStats]);

  // Search operation
  const search = useCallback(async (key: string) => {
    if (!key.trim()) return;
    
    setIsAnimating(true);
    const hashIndex = hashFunction(key, hashTable.size);
    
    // Highlight the target bucket
    setHashTable(prev => ({
      ...prev,
      buckets: prev.buckets.map(bucket => ({
        ...bucket,
        isActive: bucket.index === hashIndex,
        isHighlighted: false
      })),
      currentOperation: `Searching for key "${key}"`,
      operations: [...prev.operations, `Hash("${key}") = ${hashIndex}`]
    }));

    await new Promise(resolve => setTimeout(resolve, Math.max(500, 1000 / speed)));

    // Search in the chain
    const targetBucket = hashTable.buckets[hashIndex];
    const foundNode = targetBucket.nodes.find(node => node.key === key);
    
    setHashTable(prev => ({
      ...prev,
      operations: [...prev.operations, 
        foundNode 
          ? `Found "${key}" with value ${foundNode.value} in chain at index ${hashIndex}`
          : `Key "${key}" not found in chain at index ${hashIndex}`
      ]
    }));

    await new Promise(resolve => setTimeout(resolve, Math.max(500, 1000 / speed)));

    // Reset highlighting
    setHashTable(prev => ({
      ...prev,
      buckets: prev.buckets.map(bucket => ({
        ...bucket,
        isActive: false,
        isHighlighted: false
      })),
      currentOperation: ""
    }));

    setIsAnimating(false);
  }, [hashFunction, hashTable.size, hashTable.buckets, speed]);

  // Delete operation
  const deleteKey = useCallback(async (key: string) => {
    if (!key.trim()) return;
    
    setIsAnimating(true);
    const hashIndex = hashFunction(key, hashTable.size);
    
    // Highlight the target bucket
    setHashTable(prev => ({
      ...prev,
      buckets: prev.buckets.map(bucket => ({
        ...bucket,
        isActive: bucket.index === hashIndex,
        isHighlighted: false
      })),
      currentOperation: `Deleting key "${key}"`,
      operations: [...prev.operations, `Hash("${key}") = ${hashIndex}`]
    }));

    await new Promise(resolve => setTimeout(resolve, Math.max(500, 1000 / speed)));

    // Remove from chain
    setHashTable(prev => {
      const newBuckets = [...prev.buckets];
      const targetBucket = { ...newBuckets[hashIndex] };
      const nodeIndex = targetBucket.nodes.findIndex(node => node.key === key);
      
      if (nodeIndex !== -1) {
        targetBucket.nodes = targetBucket.nodes.filter(node => node.key !== key);
        targetBucket.isHighlighted = true;
        newBuckets[hashIndex] = targetBucket;
        
        return {
          ...prev,
          buckets: newBuckets,
          operations: [...prev.operations, `Deleted "${key}" from chain at index ${hashIndex}`]
        };
      } else {
        return {
          ...prev,
          operations: [...prev.operations, `Key "${key}" not found for deletion`]
        };
      }
    });

    await new Promise(resolve => setTimeout(resolve, Math.max(500, 1000 / speed)));

    // Reset highlighting
    setHashTable(prev => ({
      ...prev,
      buckets: prev.buckets.map(bucket => ({
        ...bucket,
        isActive: false,
        isHighlighted: false
      })),
      currentOperation: ""
    }));

    // Update stats
    updateStats(hashTable.buckets);
    setIsAnimating(false);
  }, [hashFunction, hashTable.size, hashTable.buckets, speed, updateStats]);

  const handleInsert = () => {
    const value = parseInt(inputValue);
    if (inputKey.trim() && !isNaN(value)) {
      insert(inputKey.trim(), value);
      setInputKey("");
      setInputValue("");
    }
  };

  const handleSearch = () => {
    if (searchKey.trim()) {
      search(searchKey.trim());
    }
  };

  const handleDelete = () => {
    if (searchKey.trim()) {
      deleteKey(searchKey.trim());
    }
  };

  const generateSampleData = () => {
    if (isAnimating) return;
    
    const sampleKeys = ["apple", "banana", "cherry", "date", "elderberry", "fig", "grape"];
    const sampleValues = [10, 20, 30, 40, 50, 60, 70];
    
    // Clear table first
    initializeHashTable();
    
    // Insert sample data with delay
    setTimeout(() => {
      sampleKeys.forEach((key, index) => {
        setTimeout(() => {
          insert(key, sampleValues[index]);
        }, index * 800);
      });
    }, 500);
  };

  return (
    <div className="h-full flex flex-col p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Open Hash Table (Separate Chaining)</h2>
        <p className="text-muted-foreground">
          Hash table implementation that handles collisions using linked lists at each bucket.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex gap-2">
          <Input
            type="text"
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            placeholder="Key"
            className="w-24"
            onKeyDown={(e) => e.key === "Enter" && handleInsert()}
          />
          <Input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Value"
            className="w-24"
            onKeyDown={(e) => e.key === "Enter" && handleInsert()}
          />
          <Button 
            onClick={handleInsert} 
            disabled={!inputKey.trim() || !inputValue.trim() || isAnimating}
          >
            <Plus className="h-4 w-4 mr-2" />
            Insert
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Input
            type="text"
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
            placeholder="Search/Delete key"
            className="w-40"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
          />
          <Button onClick={handleSearch} disabled={!searchKey.trim() || isAnimating}>
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
          <Button onClick={handleDelete} disabled={!searchKey.trim() || isAnimating} variant="destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={generateSampleData} disabled={isAnimating} variant="outline">
            <Shuffle className="h-4 w-4 mr-2" />
            Sample Data
          </Button>
          <Button onClick={initializeHashTable} disabled={isAnimating} variant="outline">
            <RotateCcw className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>

      <div className="flex-1 flex gap-6">
        {/* Hash Table Visualization */}
        <div className="flex-1 flex flex-col">
          {/* Current Operation */}
          {hashTable.currentOperation && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm font-medium text-blue-800">
                {hashTable.currentOperation}
              </div>
            </div>
          )}

          {/* Hash Table */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="space-y-3 max-w-4xl mx-auto">
              {hashTable.buckets.map((bucket) => (
                <motion.div
                  key={bucket.index}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg border-2 transition-colors
                    ${bucket.isActive 
                      ? 'border-purple-500 bg-purple-50' 
                      : bucket.isHighlighted 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 bg-white'
                    }
                  `}
                  animate={{
                    scale: bucket.isActive ? 1.02 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Bucket Index */}
                  <div className={`
                    w-12 h-12 flex items-center justify-center rounded-lg font-bold text-sm
                    ${bucket.isActive 
                      ? 'bg-purple-500 text-white' 
                      : 'bg-gray-100 text-gray-700'
                    }
                  `}>
                    {bucket.index}
                  </div>

                  {/* Chain */}
                  <div className="flex-1 flex items-center gap-2">
                    <AnimatePresence>
                      {bucket.nodes.length === 0 ? (
                        <div className="text-gray-400 text-sm italic">Empty</div>
                      ) : (
                        bucket.nodes.map((node, nodeIndex) => (
                          <motion.div
                            key={node.id}
                            className="flex items-center gap-2"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.3 }}
                          >
                            {nodeIndex > 0 && (
                              <div className="text-gray-400">→</div>
                            )}
                            <div className="bg-blue-100 border border-blue-300 rounded-lg px-3 py-2 text-sm">
                              <div className="font-medium text-blue-800">{node.key}</div>
                              <div className="text-blue-600 text-xs">{node.value}</div>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Chain Length Indicator */}
                  {bucket.nodes.length > 0 && (
                    <div className={`
                      px-2 py-1 rounded text-xs font-medium
                      ${bucket.nodes.length > 1 
                        ? 'bg-orange-100 text-orange-800' 
                        : 'bg-green-100 text-green-800'
                      }
                    `}>
                      {bucket.nodes.length}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Statistics */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalElements}</div>
              <div className="text-sm text-blue-800">Elements</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{stats.loadFactor}</div>
              <div className="text-sm text-green-800">Load Factor</div>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.collisions}</div>
              <div className="text-sm text-orange-800">Collisions</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.maxChainLength}</div>
              <div className="text-sm text-purple-800">Max Chain</div>
            </div>
          </div>
        </div>

        {/* Operations Log */}
        <div className="w-80 bg-muted/50 rounded-lg p-4">
          <h3 className="font-medium mb-3">Operations Log:</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {hashTable.operations.map((operation, index) => (
              <div 
                key={index} 
                className="text-sm p-2 rounded bg-blue-50 text-blue-800"
              >
                {operation}
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
            <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded"></div>
            <span>Empty bucket</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <span>Active bucket</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
            <span>Hash node</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
            <span>Single element</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-100 border border-orange-300 rounded"></div>
            <span>Collision chain</span>
          </div>
        </div>
      </div>
    </div>
  );
}