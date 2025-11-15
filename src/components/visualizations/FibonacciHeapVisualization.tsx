"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, RotateCcw, Shuffle } from "lucide-react";

interface FibonacciHeapVisualizationProps {
  speed: number;
}

interface HeapNode {
  value: number;
  children: HeapNode[];
  marked: boolean;
  id: string;
}

interface HeapState {
  roots: HeapNode[];
  minNode: HeapNode | null;
  operations: string[];
  currentOperation: string;
}

export default function FibonacciHeapVisualization({ speed }: FibonacciHeapVisualizationProps) {
  const [heap, setHeap] = useState<HeapState>({
    roots: [],
    minNode: null,
    operations: [],
    currentOperation: ""
  });
  const [inputValue, setInputValue] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);

  const createNode = (value: number): HeapNode => ({
    value,
    children: [],
    marked: false,
    id: `node-${Date.now()}-${Math.random()}`
  });

  const insert = useCallback(async (value: number) => {
    setIsAnimating(true);
    
    const newNode = createNode(value);

    setHeap(prev => ({
      ...prev,
      currentOperation: `Inserting ${value} into root list`,
      operations: [...prev.operations, `Created new node with value ${value}`]
    }));

    await new Promise(resolve => setTimeout(resolve, Math.max(500, 1000 / speed)));

    setHeap(prev => {
      const newRoots = [...prev.roots, newNode];
      const newMin = !prev.minNode || value < prev.minNode.value ? newNode : prev.minNode;
      
      return {
        ...prev,
        roots: newRoots,
        minNode: newMin,
        operations: [...prev.operations, 
          value < (prev.minNode?.value ?? Infinity) 
            ? `New minimum: ${value}` 
            : `Added to root list, min remains ${prev.minNode?.value}`
        ],
        currentOperation: ""
      };
    });

    setIsAnimating(false);
  }, [speed]);

  const extractMin = useCallback(async () => {
    // Get current state
    let currentMinNode: HeapNode | null = null;
    let currentRoots: HeapNode[] = [];
    
    setHeap(prev => {
      currentMinNode = prev.minNode;
      currentRoots = prev.roots;
      return prev;
    });

    if (!currentMinNode) return;

    setIsAnimating(true);
    
    // Type assertion since we checked null above
    const minNode: HeapNode = currentMinNode;
    const minValue = minNode.value;

    setHeap(prev => ({
      ...prev,
      currentOperation: `Extracting minimum ${minValue}`,
      operations: [...prev.operations, `Removing minimum node ${minValue}`]
    }));

    await new Promise(resolve => setTimeout(resolve, Math.max(500, 1000 / speed)));

    // Add children of min to root list
    const minChildren = minNode.children;
    const newRoots = currentRoots
      .filter(node => node.id !== minNode.id)
      .concat(minChildren);

    if (newRoots.length === 0) {
      setHeap(prev => ({
        ...prev,
        roots: [],
        minNode: null,
        operations: [...prev.operations, "Heap is now empty"],
        currentOperation: ""
      }));
      setIsAnimating(false);
      return;
    }

    setHeap(prev => ({
      ...prev,
      currentOperation: "Consolidating trees...",
      operations: [...prev.operations, `Added ${minChildren.length} children to root list`]
    }));

    await new Promise(resolve => setTimeout(resolve, Math.max(500, 1000 / speed)));

    // Consolidate: merge trees of same degree
    const degreeMap = new Map<number, HeapNode>();
    
    for (const root of newRoots) {
      let node: HeapNode = root;
      let degree = node.children.length;
      
      while (degreeMap.has(degree)) {
        let other = degreeMap.get(degree);
        if (!other) break;
        
        degreeMap.delete(degree);
        
        // Link trees (smaller root becomes parent)
        if (node.value > other.value) {
          const temp = node;
          node = other;
          other = temp;
        }
        
        node = {
          ...node,
          children: [...node.children, other]
        };
        degree++;
      }
      
      degreeMap.set(degree, node);
    }

    const consolidatedRoots: HeapNode[] = Array.from(degreeMap.values());
    if (consolidatedRoots.length === 0) {
      setHeap(prev => ({
        ...prev,
        roots: [],
        minNode: null,
        operations: [...prev.operations, "Heap is now empty after consolidation"],
        currentOperation: ""
      }));
      setIsAnimating(false);
      return;
    }
    
    let newMin: HeapNode = consolidatedRoots[0];
    for (const node of consolidatedRoots) {
      if (node.value < newMin.value) {
        newMin = node;
      }
    }

    setHeap(prev => ({
      ...prev,
      roots: consolidatedRoots,
      minNode: newMin,
      operations: [...prev.operations, `Consolidated to ${consolidatedRoots.length} trees, new min: ${newMin.value}`],
      currentOperation: ""
    }));

    setIsAnimating(false);
  }, [speed]);

  const renderTree = (node: HeapNode, x: number, y: number, isMin: boolean, level: number = 0): React.ReactElement[] => {
    const elements: React.ReactElement[] = [];
    const nodeRadius = 18;
    const verticalSpacing = 50;

    // For Fibonacci heap, arrange children vertically below and to the right
    node.children.forEach((child, idx) => {
      const childX = x + 45;
      const childY = y + (idx + 1) * verticalSpacing;
      
      elements.push(
        <line
          key={`edge-${node.id}-${child.id}`}
          x1={x}
          y1={y + nodeRadius}
          x2={childX}
          y2={childY - nodeRadius}
          stroke="#cbd5e1"
          strokeWidth="1.5"
        />
      );
      
      elements.push(...renderTree(child, childX, childY, false, level + 1));
    });

    // Draw node
    elements.push(
      <g key={node.id}>
        <circle
          cx={x}
          cy={y}
          r={nodeRadius}
          fill={isMin ? "#10b981" : node.marked ? "#f59e0b" : "#3b82f6"}
          stroke={isMin ? "#059669" : node.marked ? "#d97706" : "#2563eb"}
          strokeWidth="2"
        />
        <text
          x={x}
          y={y + 4}
          textAnchor="middle"
          className="text-xs font-bold fill-white"
        >
          {node.value}
        </text>
        {node.marked && (
          <text
            x={x + nodeRadius - 5}
            y={y - nodeRadius + 8}
            className="text-xs fill-orange-600 font-bold"
          >
            *
          </text>
        )}
      </g>
    );

    return elements;
  };

  const handleInsert = () => {
    const value = parseInt(inputValue);
    if (!isNaN(value)) {
      insert(value);
      setInputValue("");
    }
  };

  const generateSampleData = async () => {
    if (isAnimating) return;
    
    setHeap({ roots: [], minNode: null, operations: [], currentOperation: "" });
    
    const sampleValues = [10, 5, 20, 15, 30, 8, 25];
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    for (const value of sampleValues) {
      await insert(value);
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  };

  const clear = () => {
    if (isAnimating) return;
    setHeap({ roots: [], minNode: null, operations: [], currentOperation: "" });
  };

  return (
    <div className="h-full flex flex-col p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Fibonacci Heap</h2>
        <p className="text-muted-foreground">
          Advanced heap with amortized O(1) insert and decrease-key operations. Uses lazy consolidation.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex gap-2">
          <Input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter value"
            className="w-32"
            onKeyDown={(e) => e.key === "Enter" && handleInsert()}
          />
          <Button 
            onClick={handleInsert} 
            disabled={!inputValue.trim() || isAnimating}
          >
            <Plus className="h-4 w-4 mr-2" />
            Insert
          </Button>
          <Button 
            onClick={extractMin} 
            disabled={!heap.minNode || isAnimating}
            variant="destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Extract Min
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={generateSampleData} disabled={isAnimating} variant="outline">
            <Shuffle className="h-4 w-4 mr-2" />
            Sample Data
          </Button>
          <Button onClick={clear} disabled={isAnimating} variant="outline">
            <RotateCcw className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-6 min-h-0">
        {/* Visualization */}
        <div className="flex-1 flex flex-col min-h-0">
          {heap.currentOperation && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm font-medium text-blue-800">
                {heap.currentOperation}
              </div>
            </div>
          )}

          {heap.minNode && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <div className="bg-green-100 text-green-800 px-3 py-2 rounded-lg font-medium text-sm">
                Minimum: {heap.minNode.value}
              </div>
              <div className="text-sm text-muted-foreground">
                Root Trees: {heap.roots.length}
              </div>
            </div>
          )}

          <div className="flex-1 relative bg-white rounded-lg border overflow-hidden min-h-0">
            {heap.roots.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Heap is empty. Insert values to see the structure.
              </div>
            ) : (
              <div className="h-full overflow-auto p-4">
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4 pb-4">
                  <AnimatePresence>
                    {heap.roots.map((root) => {
                      const isMin = root.id === heap.minNode?.id;
                      
                      // Calculate tree dimensions based on structure
                      const countNodes = (node: HeapNode): number => {
                        return 1 + node.children.reduce((sum, child) => sum + countNodes(child), 0);
                      };
                      
                      const nodeCount = countNodes(root);
                      const hasChildren = root.children.length > 0;
                      
                      // Use compact grid layout for single nodes, larger for trees
                      if (!hasChildren) {
                        return (
                          <motion.div
                            key={root.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex items-center justify-center p-1"
                          >
                            <div className="w-12 h-12 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm"
                              style={{
                                backgroundColor: isMin ? '#10b981' : '#3b82f6',
                                border: `2px solid ${isMin ? '#059669' : '#2563eb'}`
                              }}
                            >
                              {root.value}
                            </div>
                          </motion.div>
                        );
                      }
                      
                      // For trees with children, use larger display
                      const treeHeight = Math.max(150, nodeCount * 50 + 60);
                      const treeWidth = Math.max(120, root.children.length * 45 + 80);
                      
                      return (
                        <motion.div
                          key={root.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="col-span-2"
                        >
                          <div className="text-center mb-2">
                            <div className="text-xs text-gray-500">
                              {nodeCount} node{nodeCount !== 1 ? 's' : ''}
                            </div>
                          </div>
                          <svg 
                            width={treeWidth} 
                            height={treeHeight}
                            viewBox={`0 0 ${treeWidth} ${treeHeight}`}
                          >
                            {renderTree(root, 30, 30, isMin)}
                          </svg>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Operations Log */}
        <div className="w-full bg-muted/50 rounded-lg p-4 max-h-48">
          <h3 className="font-medium mb-3">Operations Log:</h3>
          <div className="space-y-2 overflow-y-auto max-h-32">
            {heap.operations.length === 0 ? (
              <div className="text-sm text-muted-foreground italic">No operations yet</div>
            ) : (
              heap.operations.slice(-10).map((operation, index) => (
                <div 
                  key={index} 
                  className="text-sm p-2 rounded bg-blue-50 text-blue-800"
                >
                  {operation}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <div className="text-sm font-medium mb-2">Legend & Complexity:</div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span>Minimum node</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span>Regular node</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
              <span>Marked node</span>
            </div>
          </div>
          <div className="text-xs space-y-1">
            <div>• Insert: O(1) amortized</div>
            <div>• Extract Min: O(log n) amortized</div>
            <div>• Decrease Key: O(1) amortized</div>
            <div>• Merge: O(1)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
