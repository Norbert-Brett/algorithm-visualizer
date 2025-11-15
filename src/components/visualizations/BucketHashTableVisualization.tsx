"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Trash2, RotateCcw, Shuffle } from "lucide-react";

interface BucketHashTableVisualizationProps {
  speed: number;
}

interface HashNode {
  key: string;
  value: number;
  id: string;
}

interface Bucket {
  index: number;
  nodes: HashNode[];
  capacity: number;
  isActive: boolean;
  isHighlighted: boolean;
  isFull: boolean;
}

interface HashTableState {
  buckets: Bucket[];
  size: number;
  bucketCapacity: number;
  operations: string[];
  currentOperation: string;
}

export default function BucketHashTableVisualization({ speed }: BucketHashTableVisualizationProps) {
  const [hashTable, setHashTable] = useState<HashTableState>({
    buckets: [],
    size: 5,
    bucketCapacity: 3,
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
    fullBuckets: 0,
    avgBucketSize: 0
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
    const buckets: Bucket[] = [];
    for (let i = 0; i < hashTable.size; i++) {
      buckets.push({
        index: i,
        nodes: [],
        capacity: hashTable.bucketCapacity,
        isActive: false,
        isHighlighted: false,
        isFull: false
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
      fullBuckets: 0,
      avgBucketSize: 0
    });
  }, [hashTable.size, hashTable.bucketCapacity]);

  // Initialize on mount
  useEffect(() => {
    initializeHashTable();
  }, [initializeHashTable]);

  // Update statistics
  const updateStats = useCallback((buckets: Bucket[]) => {
    const totalElements = buckets.reduce((sum, bucket) => sum + bucket.nodes.length, 0);
    const maxCapacity = buckets.length * hashTable.bucketCapacity;
    const loadFactor = totalElements / maxCapacity;
    const fullBuckets = buckets.filter(bucket => bucket.nodes.length >= bucket.capacity).length;
    const avgBucketSize = totalElements / buckets.length;
    
    setStats({
      totalElements,
      loadFactor: Math.round(loadFactor * 100) / 100,
      fullBuckets,
      avgBucketSize: Math.round(avgBucketSize * 100) / 100
    });
  }, [hashTable.bucketCapacity]);

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

    const targetBucket = hashTable.buckets[hashIndex];
    
    // Check if bucket is full
    if (targetBucket.nodes.length >= targetBucket.capacity) {
      setHashTable(prev => ({
        ...prev,
        operations: [...prev.operations, `Bucket ${hashIndex} is full! Cannot insert "${key}"`]
      }));
      
      await new Promise(resolve => setTimeout(resolve, Math.max(500, 1000 / speed)));
      
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
      return;
    }

    // Check if key already exists
    const existingNodeIndex = targetBucket.nodes.findIndex(node => node.key === key);
    
    setHashTable(prev => {
      const newBuckets = [...prev.buckets];
      const updatedBucket = { ...newBuckets[hashIndex] };
      
      if (existingNodeIndex !== -1) {
        // Update existing key
        updatedBucket.nodes = [...updatedBucket.nodes];
        updatedBucket.nodes[existingNodeIndex] = {
          ...updatedBucket.nodes[existingNodeIndex],
          value
        };
        newBuckets[hashIndex] = updatedBucket;
        
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
        
        updatedBucket.nodes = [...updatedBucket.nodes, newNode];
        updatedBucket.isHighlighted = true;
        updatedBucket.isFull = updatedBucket.nodes.length >= updatedBucket.capacity;
        newBuckets[hashIndex] = updatedBucket;
        
        return {
          ...prev,
          buckets: newBuckets,
          operations: [...prev.operations, 
            `Added "${key}" to bucket ${hashIndex} (${updatedBucket.nodes.length}/${updatedBucket.capacity})`
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

    // Search in the bucket
    const targetBucket = hashTable.buckets[hashIndex];
    const foundNode = targetBucket.nodes.find(node => node.key === key);
    
    setHashTable(prev => ({
      ...prev,
      operations: [...prev.operations, 
        foundNode 
          ? `Found "${key}" with value ${foundNode.value} in bucket ${hashIndex}`
          : `Key "${key}" not found in bucket ${hashIndex}`
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

    // Remove from bucket
    setHashTable(prev => {
      const newBuckets = [...prev.buckets];
      const targetBucket = { ...newBuckets[hashIndex] };
      const nodeIndex = targetBucket.nodes.findIndex(node => node.key === key);
      
      if (nodeIndex !== -1) {
        targetBucket.nodes = targetBucket.nodes.filter(node => node.key !== key);
        targetBucket.isHighlighted = true;
        targetBucket.isFull = false;
        newBuckets[hashIndex] = targetBucket;
        
        return {
          ...prev,
          buckets: newBuckets,
          operations: [...prev.operations, 
            `Deleted "${key}" from bucket ${hashIndex} (${targetBucket.nodes.length}/${targetBucket.capacity})`
          ]
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
    
    const sampleKeys = ["red", "blue", "green", "yellow", "orange", "purple", "pink", "brown"];
    const sampleValues = [100, 200, 300, 400, 500, 600, 700, 800];
    
    initializeHashTable();
    
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
        <h2 className="text-2xl font-bold mb-2">Bucket Hash Table</h2>
        <p className="text-muted-foreground">
          Hash table where each bucket has a fixed capacity for storing multiple key-value pairs.
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
            <div className="space-y-4 max-w-5xl mx-auto">
              {hashTable.buckets.map((bucket) => (
                <motion.div
                  key={bucket.index}
                  className={`
                    flex items-center gap-3 p-4 rounded-lg border-2 transition-colors
                    ${bucket.isActive 
                      ? 'border-purple-500 bg-purple-50' 
                      : bucket.isHighlighted 
                      ? 'border-green-500 bg-green-50' 
                      : bucket.isFull
                      ? 'border-red-300 bg-red-50'
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
                    w-14 h-14 flex items-center justify-center rounded-lg font-bold
                    ${bucket.isActive 
                      ? 'bg-purple-500 text-white' 
                      : bucket.isFull
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 text-gray-700'
                    }
                  `}>
                    <div className="text-center">
                      <div className="text-lg">{bucket.index}</div>
                      <div className="text-xs opacity-75">
                        {bucket.nodes.length}/{bucket.capacity}
                      </div>
                    </div>
                  </div>

                  {/* Bucket Slots */}
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <AnimatePresence>
                      {Array.from({ length: bucket.capacity }).map((_, slotIndex) => {
                        const node = bucket.nodes[slotIndex];
                        return (
                          <motion.div
                            key={slotIndex}
                            className={`
                              h-16 rounded-lg border-2 flex items-center justify-center
                              ${node 
                                ? 'bg-blue-100 border-blue-300' 
                                : 'bg-gray-50 border-gray-200 border-dashed'
                              }
                            `}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.3 }}
                          >
                            {node ? (
                              <div className="text-center px-2">
                                <div className="font-medium text-blue-800 text-sm truncate">
                                  {node.key}
                                </div>
                                <div className="text-blue-600 text-xs">{node.value}</div>
                              </div>
                            ) : (
                              <div className="text-gray-400 text-xs">Empty</div>
                            )}
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>

                  {/* Bucket Status */}
                  <div className={`
                    px-3 py-1 rounded text-xs font-medium
                    ${bucket.isFull
                      ? 'bg-red-100 text-red-800' 
                      : bucket.nodes.length > 0
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-600'
                    }
                  `}>
                    {bucket.isFull ? 'FULL' : bucket.nodes.length > 0 ? 'ACTIVE' : 'EMPTY'}
                  </div>
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
            <div className="bg-red-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600">{stats.fullBuckets}</div>
              <div className="text-sm text-red-800">Full Buckets</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.avgBucketSize}</div>
              <div className="text-sm text-purple-800">Avg Size</div>
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
            <div className="w-4 h-4 bg-gray-50 border-2 border-gray-200 border-dashed rounded"></div>
            <span>Empty slot</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <span>Active bucket</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
            <span>Occupied slot</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Full bucket</span>
          </div>
        </div>
      </div>
    </div>
  );
}
