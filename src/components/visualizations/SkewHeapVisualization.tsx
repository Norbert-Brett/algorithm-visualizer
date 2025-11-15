"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, RotateCcw, Shuffle, RefreshCw } from "lucide-react";

interface SkewHeapVisualizationProps {
  speed: number;
}

interface HeapNode {
  value: number;
  left: HeapNode | null;
  right: HeapNode | null;
  id: string;
}

interface HeapState {
  root: HeapNode | null;
  operations: string[];
  currentOperation: string;
  swapCount: number;
}

export default function SkewHeapVisualization({ speed }: SkewHeapVisualizationProps) {
  const [heap, setHeap] = useState<HeapState>({
    root: null,
    operations: [],
    currentOperation: "",
    swapCount: 0
  });
  const [inputValue, setInputValue] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);

  const createNode = (value: number): HeapNode => ({
    value,
    left: null,
    right: null,
    id: `node-${Date.now()}-${Math.random()}`
  });

  const merge = useCallback((h1: HeapNode | null, h2: HeapNode | null, swapCount: number): { result: HeapNode | null; swaps: number } => {
    if (!h1) return { result: h2, swaps: swapCount };
    if (!h2) return { result: h1, swaps: swapCount };

    // Ensure h1 has smaller root
    if (h1.value > h2.value) {
      [h1, h2] = [h2, h1];
    }

    // Merge h2 with right subtree of h1
    const mergeResult = merge(h1.right, h2, swapCount);
    
    // ALWAYS swap left and right children (skew heap property)
    const newNode: HeapNode = {
      ...h1,
      left: mergeResult.result,
      right: h1.left,
      id: h1.id
    };

    return { result: newNode, swaps: mergeResult.swaps + 1 };
  }, []);

  const insert = useCallback(async (value: number) => {
    setIsAnimating(true);
    
    const newNode = createNode(value);

    // Get current state
    let currentRoot: HeapNode | null = null;
    let currentSwapCount = 0;
    
    setHeap(prev => {
      currentRoot = prev.root;
      currentSwapCount = prev.swapCount;
      return {
        ...prev,
        currentOperation: `Inserting ${value}`,
        operations: [...prev.operations, `Creating node with value ${value}`]
      };
    });

    await new Promise(resolve => setTimeout(resolve, Math.max(500, 1000 / speed)));

    setHeap(prev => ({
      ...prev,
      currentOperation: "Merging with heap (swapping children)...",
      operations: [...prev.operations, "Merging and unconditionally swapping children"]
    }));

    await new Promise(resolve => setTimeout(resolve, Math.max(500, 1000 / speed)));

    const mergeResult = merge(currentRoot, newNode, currentSwapCount);

    setHeap(prev => ({
      ...prev,
      root: mergeResult.result,
      swapCount: mergeResult.swaps,
      operations: [...prev.operations, `Inserted ${value}, performed ${mergeResult.swaps - currentSwapCount} swap(s)`],
      currentOperation: ""
    }));

    setIsAnimating(false);
  }, [merge, speed]);

  const deleteMin = useCallback(async () => {
    // Get current state
    let currentRoot: HeapNode | null = null;
    let currentSwapCount = 0;
    
    setHeap(prev => {
      currentRoot = prev.root;
      currentSwapCount = prev.swapCount;
      return prev;
    });

    if (!currentRoot) return;

    setIsAnimating(true);
    
    const rootNode: HeapNode = currentRoot;
    const minValue = rootNode.value;

    setHeap(prev => ({
      ...prev,
      currentOperation: `Removing minimum ${minValue}`,
      operations: [...prev.operations, `Extracting minimum: ${minValue}`]
    }));

    await new Promise(resolve => setTimeout(resolve, Math.max(500, 1000 / speed)));

    setHeap(prev => ({
      ...prev,
      currentOperation: "Merging left and right subtrees...",
      operations: [...prev.operations, "Merging subtrees with unconditional swaps"]
    }));

    await new Promise(resolve => setTimeout(resolve, Math.max(500, 1000 / speed)));

    const mergeResult = merge(rootNode.left, rootNode.right, currentSwapCount);

    setHeap(prev => ({
      ...prev,
      root: mergeResult.result,
      swapCount: mergeResult.swaps,
      operations: [...prev.operations, 
        mergeResult.result 
          ? `New root: ${mergeResult.result.value}, total swaps: ${mergeResult.swaps}` 
          : "Heap is now empty"
      ],
      currentOperation: ""
    }));

    setIsAnimating(false);
  }, [merge, speed]);

  const renderTree = (node: HeapNode | null, x: number, y: number, offset: number): React.ReactElement[] => {
    if (!node) return [];

    const elements: React.ReactElement[] = [];
    const nodeRadius = 22;
    const verticalSpacing = 70;

    // Draw edges with swap indicators
    if (node.left) {
      const leftX = x - offset;
      const leftY = y + verticalSpacing;
      elements.push(
        <g key={`edge-left-${node.id}`}>
          <line
            x1={x}
            y1={y}
            x2={leftX}
            y2={leftY}
            stroke="#8b5cf6"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
          <text
            x={(x + leftX) / 2 - 10}
            y={(y + leftY) / 2}
            className="text-xs fill-purple-600 font-medium"
          >
            L
          </text>
        </g>
      );
      elements.push(...renderTree(node.left, leftX, leftY, offset / 2));
    }

    if (node.right) {
      const rightX = x + offset;
      const rightY = y + verticalSpacing;
      elements.push(
        <g key={`edge-right-${node.id}`}>
          <line
            x1={x}
            y1={y}
            x2={rightX}
            y2={rightY}
            stroke="#e5e7eb"
            strokeWidth="2"
          />
          <text
            x={(x + rightX) / 2 + 10}
            y={(y + rightY) / 2}
            className="text-xs fill-gray-500 font-medium"
          >
            R
          </text>
        </g>
      );
      elements.push(...renderTree(node.right, rightX, rightY, offset / 2));
    }

    // Draw node
    elements.push(
      <g key={node.id}>
        <circle
          cx={x}
          cy={y}
          r={nodeRadius}
          fill={y === 50 ? "#10b981" : "#8b5cf6"}
          stroke={y === 50 ? "#059669" : "#7c3aed"}
          strokeWidth="2"
        />
        <text
          x={x}
          y={y + 5}
          textAnchor="middle"
          className="text-sm font-bold fill-white"
        >
          {node.value}
        </text>
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
    
    setHeap({ root: null, operations: [], currentOperation: "", swapCount: 0 });
    
    const sampleValues = [10, 20, 5, 30, 15, 25, 8];
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    for (const value of sampleValues) {
      await insert(value);
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  };

  const clear = () => {
    if (isAnimating) return;
    setHeap({ root: null, operations: [], currentOperation: "", swapCount: 0 });
  };

  return (
    <div className="h-full flex flex-col p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Skew Heap</h2>
        <p className="text-muted-foreground">
          Self-adjusting heap that unconditionally swaps children during merge. Simpler than leftist heap.
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
            onClick={deleteMin} 
            disabled={!heap.root || isAnimating}
            variant="destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Min
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

          {heap.root && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <div className="bg-green-100 text-green-800 px-3 py-2 rounded-lg font-medium text-sm">
                Minimum: {heap.root.value}
              </div>
              <div className="bg-purple-100 text-purple-800 px-3 py-2 rounded-lg font-medium text-sm flex items-center gap-1">
                <RefreshCw className="h-3 w-3" />
                Total Swaps: {heap.swapCount}
              </div>
            </div>
          )}

          <div className="flex-1 relative bg-white rounded-lg border overflow-hidden min-h-0">
            {!heap.root ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Heap is empty. Insert values to see self-adjusting behavior.
              </div>
            ) : (
              <div className="h-full overflow-auto p-6 flex items-center justify-center">
                <svg width="800" height="500" viewBox="0 0 800 500" className="max-w-full">
                  <AnimatePresence>
                    <motion.g
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {renderTree(heap.root, 400, 50, 150)}
                    </motion.g>
                  </AnimatePresence>
                </svg>
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
        <div className="text-sm font-medium mb-2">Legend & Properties:</div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span>Root (minimum)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
              <span>Regular node</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-purple-500" style={{borderTop: "2px dashed"}}></div>
              <span>Left child (swapped)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-gray-300"></div>
              <span>Right child</span>
            </div>
          </div>
          <div className="text-xs space-y-1">
            <div>• Insert: O(log n) amortized</div>
            <div>• Delete Min: O(log n) amortized</div>
            <div>• Merge: O(log n) amortized</div>
            <div>• Always swaps children</div>
            <div>• No balance info needed</div>
            <div>• Simpler than leftist heap</div>
          </div>
        </div>
      </div>
    </div>
  );
}
