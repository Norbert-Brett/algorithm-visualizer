"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Trash2, RotateCcw, Shuffle } from "lucide-react";

interface ClosedHashTableVisualizationProps {
  speed: number;
}

interface HashSlot {
  index: number;
  key: string | null;
  value: number | null;
  isDeleted: boolean;
  isActive: boolean;
  isHighlighted: boolean;
  probeCount?: number;
}

interface HashTableState {
  slots: HashSlot[];
  size: number;
  operations: string[];
  currentOperation: string;
}

export default function ClosedHashTableVisualization({ speed }: ClosedHashTableVisualizationProps) {
  const [hashTable, setHashTable] = useState<HashTableState>({
    slots: [],
    size: 11, // Prime number for better distribution
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
    probes: 0,
    avgProbeLength: 0
  });

  // Simple hash function (djb2)
  const hashFunction = useCallback((key: string, tableSize: number): number => {
    let hash = 5381;
    for (let i = 0; i < key.length; i++) {
      hash = ((hash << 5) + hash) + key.charCodeAt(i);
    }
    return Math.abs(hash) % tableSize;
  }, []);

  // Linear probing
  const probe = useCallback((baseIndex: number, attempt: number, tableSize: number): number => {
    return (baseIndex + attempt) % tableSize;
  }, []);

  // Initialize hash table
  const initializeHashTable = useCallback(() => {
    const slots: HashSlot[] = [];
    for (let i = 0; i < hashTable.size; i++) {
      slots.push({
        index: i,
        key: null,
        value: null,
        isDeleted: false,
        isActive: false,
        isHighlighted: false
      });
    }
    
    setHashTable(prev => ({
      ...prev,
      slots,
      operations: [],
      currentOperation: ""
    }));
    
    setStats({
      totalElements: 0,
      loadFactor: 0,
      probes: 0,
      avgProbeLength: 0
    });
  }, [hashTable.size]);

  // Initialize on mount
  useEffect(() => {
    initializeHashTable();
  }, [initializeHashTable]);

  // Update statistics
  const updateStats = useCallback((slots: HashSlot[]) => {
    const totalElements = slots.filter(slot => slot.key !== null && !slot.isDeleted).length;
    const loadFactor = totalElements / slots.length;
    const probeSum = slots.reduce((sum, slot) => sum + (slot.probeCount || 0), 0);
    const avgProbeLength = totalElements > 0 ? Math.round((probeSum / totalElements) * 100) / 100 : 0;
    
    setStats({
      totalElements,
      loadFactor: Math.round(loadFactor * 100) / 100,
      probes: probeSum,
      avgProbeLength
    });
  }, []);

  // Insert operation
  const insert = useCallback(async (key: string, value: number) => {
    if (!key.trim()) return;
    
    setIsAnimating(true);
    const baseIndex = hashFunction(key, hashTable.size);
    let attempt = 0;
    let inserted = false;
    let probeCount = 0;
    
    setHashTable(prev => ({
      ...prev,
      currentOperation: `Inserting key "${key}" with value ${value}`,
      operations: [...prev.operations, `Hash("${key}") = ${baseIndex}`]
    }));

    await new Promise(resolve => setTimeout(resolve, Math.max(500, 1000 / speed)));

    // Find empty slot using linear probing
    while (attempt < hashTable.size && !inserted) {
      const currentIndex = probe(baseIndex, attempt, hashTable.size);
      probeCount++;
      
      // Highlight current probe position
      setHashTable(prev => ({
        ...prev,
        slots: prev.slots.map(slot => ({
          ...slot,
          isActive: slot.index === currentIndex,
          isHighlighted: false
        })),
        operations: [...prev.operations, `Probing index ${currentIndex} (attempt ${attempt + 1})`]
      }));

      await new Promise(resolve => setTimeout(resolve, Math.max(300, 600 / speed)));

      const currentSlot = hashTable.slots[currentIndex];
      
      // Check if slot is empty or deleted, or if key already exists
      if (currentSlot.key === null || currentSlot.isDeleted || currentSlot.key === key) {
        setHashTable(prev => {
          const newSlots = [...prev.slots];
          newSlots[currentIndex] = {
            ...newSlots[currentIndex],
            key,
            value,
            isDeleted: false,
            isHighlighted: true,
            probeCount
          };
          
          return {
            ...prev,
            slots: newSlots,
            operations: [...prev.operations, 
              currentSlot.key === key 
                ? `Updated existing key "${key}" at index ${currentIndex}`
                : `Inserted "${key}" at index ${currentIndex} after ${probeCount} probe(s)`
            ]
          };
        });
        inserted = true;
      } else {
        setHashTable(prev => ({
          ...prev,
          operations: [...prev.operations, `Collision at index ${currentIndex}, continuing probe...`]
        }));
      }
      
      attempt++;
    }

    if (!inserted) {
      setHashTable(prev => ({
        ...prev,
        operations: [...prev.operations, `Table is full! Cannot insert "${key}"`]
      }));
    }

    await new Promise(resolve => setTimeout(resolve, Math.max(500, 1000 / speed)));

    // Reset highlighting
    setHashTable(prev => ({
      ...prev,
      slots: prev.slots.map(slot => ({
        ...slot,
        isActive: false,
        isHighlighted: false
      })),
      currentOperation: ""
    }));

    updateStats(hashTable.slots);
    setIsAnimating(false);
  }, [hashFunction, probe, hashTable.size, hashTable.slots, speed, updateStats]);

  // Search operation
  const search = useCallback(async (key: string) => {
    if (!key.trim()) return;
    
    setIsAnimating(true);
    const baseIndex = hashFunction(key, hashTable.size);
    let attempt = 0;
    let found = false;
    
    setHashTable(prev => ({
      ...prev,
      currentOperation: `Searching for key "${key}"`,
      operations: [...prev.operations, `Hash("${key}") = ${baseIndex}`]
    }));

    await new Promise(resolve => setTimeout(resolve, Math.max(500, 1000 / speed)));

    while (attempt < hashTable.size && !found) {
      const currentIndex = probe(baseIndex, attempt, hashTable.size);
      
      setHashTable(prev => ({
        ...prev,
        slots: prev.slots.map(slot => ({
          ...slot,
          isActive: slot.index === currentIndex,
          isHighlighted: false
        })),
        operations: [...prev.operations, `Checking index ${currentIndex}`]
      }));

      await new Promise(resolve => setTimeout(resolve, Math.max(300, 600 / speed)));

      const currentSlot = hashTable.slots[currentIndex];
      
      if (currentSlot.key === key && !currentSlot.isDeleted) {
        setHashTable(prev => ({
          ...prev,
          operations: [...prev.operations, `Found "${key}" with value ${currentSlot.value} at index ${currentIndex}`]
        }));
        found = true;
      } else if (currentSlot.key === null && !currentSlot.isDeleted) {
        setHashTable(prev => ({
          ...prev,
          operations: [...prev.operations, `Key "${key}" not found (empty slot reached)`]
        }));
        break;
      }
      
      attempt++;
    }

    if (!found && attempt >= hashTable.size) {
      setHashTable(prev => ({
        ...prev,
        operations: [...prev.operations, `Key "${key}" not found (table fully probed)`]
      }));
    }

    await new Promise(resolve => setTimeout(resolve, Math.max(500, 1000 / speed)));

    setHashTable(prev => ({
      ...prev,
      slots: prev.slots.map(slot => ({
        ...slot,
        isActive: false,
        isHighlighted: false
      })),
      currentOperation: ""
    }));

    setIsAnimating(false);
  }, [hashFunction, probe, hashTable.size, hashTable.slots, speed]);

  // Delete operation (lazy deletion)
  const deleteKey = useCallback(async (key: string) => {
    if (!key.trim()) return;
    
    setIsAnimating(true);
    const baseIndex = hashFunction(key, hashTable.size);
    let attempt = 0;
    let deleted = false;
    
    setHashTable(prev => ({
      ...prev,
      currentOperation: `Deleting key "${key}"`,
      operations: [...prev.operations, `Hash("${key}") = ${baseIndex}`]
    }));

    await new Promise(resolve => setTimeout(resolve, Math.max(500, 1000 / speed)));

    while (attempt < hashTable.size && !deleted) {
      const currentIndex = probe(baseIndex, attempt, hashTable.size);
      
      setHashTable(prev => ({
        ...prev,
        slots: prev.slots.map(slot => ({
          ...slot,
          isActive: slot.index === currentIndex,
          isHighlighted: false
        })),
        operations: [...prev.operations, `Checking index ${currentIndex}`]
      }));

      await new Promise(resolve => setTimeout(resolve, Math.max(300, 600 / speed)));

      const currentSlot = hashTable.slots[currentIndex];
      
      if (currentSlot.key === key && !currentSlot.isDeleted) {
        setHashTable(prev => {
          const newSlots = [...prev.slots];
          newSlots[currentIndex] = {
            ...newSlots[currentIndex],
            isDeleted: true,
            isHighlighted: true
          };
          
          return {
            ...prev,
            slots: newSlots,
            operations: [...prev.operations, `Marked "${key}" as deleted at index ${currentIndex}`]
          };
        });
        deleted = true;
      } else if (currentSlot.key === null && !currentSlot.isDeleted) {
        setHashTable(prev => ({
          ...prev,
          operations: [...prev.operations, `Key "${key}" not found (empty slot reached)`]
        }));
        break;
      }
      
      attempt++;
    }

    await new Promise(resolve => setTimeout(resolve, Math.max(500, 1000 / speed)));

    setHashTable(prev => ({
      ...prev,
      slots: prev.slots.map(slot => ({
        ...slot,
        isActive: false,
        isHighlighted: false
      })),
      currentOperation: ""
    }));

    updateStats(hashTable.slots);
    setIsAnimating(false);
  }, [hashFunction, probe, hashTable.size, hashTable.slots, speed, updateStats]);

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
    
    const sampleKeys = ["cat", "dog", "bird", "fish", "lion"];
    const sampleValues = [15, 25, 35, 45, 55];
    
    initializeHashTable();
    
    setTimeout(() => {
      sampleKeys.forEach((key, index) => {
        setTimeout(() => {
          insert(key, sampleValues[index]);
        }, index * 1200);
      });
    }, 500);
  };

  return (
    <div className="h-full flex flex-col p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Closed Hash Table (Linear Probing)</h2>
        <p className="text-muted-foreground">
          Hash table with open addressing that resolves collisions using linear probing.
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-w-4xl mx-auto">
              <AnimatePresence>
                {hashTable.slots.map((slot) => (
                  <motion.div
                    key={slot.index}
                    className={`
                      relative p-4 rounded-lg border-2 transition-colors
                      ${slot.isActive 
                        ? 'border-purple-500 bg-purple-50' 
                        : slot.isHighlighted 
                        ? 'border-green-500 bg-green-50' 
                        : slot.isDeleted
                        ? 'border-red-300 bg-red-50'
                        : slot.key !== null
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-200 bg-white'
                      }
                    `}
                    animate={{
                      scale: slot.isActive ? 1.05 : 1,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Slot Index */}
                    <div className={`
                      absolute -top-2 -left-2 w-6 h-6 flex items-center justify-center 
                      rounded-full text-xs font-bold
                      ${slot.isActive 
                        ? 'bg-purple-500 text-white' 
                        : 'bg-gray-200 text-gray-700'
                      }
                    `}>
                      {slot.index}
                    </div>

                    {/* Slot Content */}
                    <div className="text-center">
                      {slot.key === null ? (
                        <div className="text-gray-400 text-sm italic">Empty</div>
                      ) : slot.isDeleted ? (
                        <div>
                          <div className="font-medium text-red-600 line-through">{slot.key}</div>
                          <div className="text-red-500 text-xs line-through">{slot.value}</div>
                          <div className="text-red-600 text-xs mt-1">DELETED</div>
                        </div>
                      ) : (
                        <div>
                          <div className="font-medium text-blue-800">{slot.key}</div>
                          <div className="text-blue-600 text-xs">{slot.value}</div>
                          {slot.probeCount && slot.probeCount > 1 && (
                            <div className="text-orange-600 text-xs mt-1">
                              {slot.probeCount} probes
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
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
              <div className="text-2xl font-bold text-orange-600">{stats.probes}</div>
              <div className="text-sm text-orange-800">Total Probes</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.avgProbeLength}</div>
              <div className="text-sm text-purple-800">Avg Probes</div>
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
            <div className="w-4 h-4 bg-white border border-gray-200 rounded"></div>
            <span>Empty slot</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <span>Active probe</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-50 border border-blue-300 rounded"></div>
            <span>Occupied slot</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-50 border border-red-300 rounded"></div>
            <span>Deleted slot</span>
          </div>
        </div>
      </div>
    </div>
  );
}
