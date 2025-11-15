"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, RotateCcw, Shuffle } from "lucide-react";

interface LeftistHeapVisualizationProps {
  speed: number;
}

interface HeapNode {
  value: number;
  npl: number; // Null Path Length
  left: HeapNode | null;
  right: HeapNode | null;
  id: string;
}

interface HeapState {
  root: HeapNode | null;
  operations: string[];
  currentOperation: string;
}

export default function LeftistHeapVisualization({ speed }: LeftistHeapVisualizationProps) {
  const [heap, setHeap] = useState<HeapState>({
    root: null,
    operations: [],
    currentOperation: ""
  });
  const [inputValue, setInputValue] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);

  const createNode = (value: number): HeapNode => ({
    value,
    npl: 0,
    left: null,
    right: null,
    id: `node-${Date.now()}-${Math.random()}`
  });

  const getNPL = (node: HeapNode | null): number => {
    return node ? node.npl : -1;
  };

  const merge = useCallback((h1: HeapNode | null, h2: HeapNode | null): HeapNode | null => {
    if (!h1) return h2;
    if (!h2) return h1;

    // Ensure h1 has smaller root
    if (h1.value > h2.value) {
      [h1, h2] = [h2, h1];
    }

    // Merge h2 with right subtree of h1
    const newRight = merge(h1.right, h2);
    
    // Maintain leftist property: left NPL >= right NPL
    const leftNPL = getNPL(h1.left);
    const rightNPL = getNPL(newRight);
    
    let newLeft = h1.left;
    let finalRight = newRight;
    
    if (leftNPL < rightNPL) {
      // Swap children to maintain leftist property
      newLeft = newRight;
      finalRight = h1.left;
    }

    return {
      ...h1,
      left: newLeft,
      right: finalRight,
      npl: Math.min(leftNPL, rightNPL) + 1
    };
  }, []);

  const insert = useCallback(async (value: number) => {
    setIsAnimating(true);
    
    const newNode = createNode(value);

    // Get current root
    let currentRoot: HeapNode | null = null;
    setHeap(prev => {
      currentRoot = prev.root;
      return {
        ...prev,
        currentOperation: `Inserting ${value}`,
        operations: [...prev.operations, `Creating node with value ${value}`]
      };
    });

    await new Promise(resolve => setTimeout(resolve, Math.max(500, 1000 / speed)));

    setHeap(prev => ({
      ...prev,
      currentOperation: "Merging with existing heap...",
      operations: [...prev.operations, "Merging new node with heap"]
    }));

    await new Promise(resolve => setTimeout(resolve, Math.max(500, 1000 / speed)));

    const newRoot = merge(currentRoot, newNode);

    setHeap(prev => ({
      ...prev,
      root: newRoot,
      operations: [...prev.operations, `Inserted ${value}, maintaining leftist property`],
      currentOperation: ""
    }));

    setIsAnimating(false);
  }, [merge, speed]);

  const deleteMin = useCallback(async () => {
    // Get current root
    let currentRoot: HeapNode | null = null;
    setHeap(prev => {
      currentRoot = prev.root;
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
      operations: [...prev.operations, "Merging subtrees of removed root"]
    }));

    await new Promise(resolve => setTimeout(resolve, Math.max(500, 1000 / speed)));

    const newRoot = merge(rootNode.left, rootNode.right);

    setHeap(prev => ({
      ...prev,
      root: newRoot,
      operations: [...prev.operations, newRoot ? `New root: ${newRoot.value}` : "Heap is now empty"],
      currentOperation: ""
    }));

    setIsAnimating(false);
  }, [merge, speed]);

  const renderTree = (node: HeapNode | null, x: number, y: number, offset: number): React.ReactElement[] => {
    if (!node) return [];

    const elements: React.ReactElement[] = [];
    const nodeRadius = 22;
    const verticalSpacing = 70;

    // Draw edges
    if (node.left) {
      const leftX = x - offset;
      const leftY = y + verticalSpacing;
      elements.push(
        <line
          key={`edge-left-${node.id}`}
          x1={x}
          y1={y}
          x2={leftX}
          y2={leftY}
          stroke="#3b82f6"
          strokeWidth="3"
        />
      );
      elements.push(...renderTree(node.left, leftX, leftY, offset / 2));
    }

    if (node.right) {
      const rightX = x + offset;
      const rightY = y + verticalSpacing;
      elements.push(
        <line
          key={`edge-right-${node.id}`}
          x1={x}
          y1={y}
          x2={rightX}
          y2={rightY}
          stroke="#e5e7eb"
          strokeWidth="2"
        />
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
          fill={y === 50 ? "#10b981" : "#3b82f6"}
          stroke={y === 50 ? "#059669" : "#2563eb"}
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
        {/* NPL indicator */}
        <circle
          cx={x + nodeRadius - 5}
          cy={y - nodeRadius + 5}
          r="8"
          fill="#f59e0b"
          stroke="#d97706"
          strokeWidth="1"
        />
        <text
          x={x + nodeRadius - 5}
          y={y - nodeRadius + 8}
          textAnchor="middle"
          className="text-xs font-bold fill-white"
        >
          {node.npl}
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
    
    setHeap({ root: null, operations: [], currentOperation: "" });
    
    const sampleValues = [10, 20, 5, 30, 15, 25, 8];
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    for (const value of sampleValues) {
      await insert(value);
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  };

  const clear = () => {
    if (isAnimating) return;
    setHeap({ root: null, operations: [], currentOperation: "" });
  };

  return (
    <div className="h-full flex flex-col p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Leftist Heap</h2>
        <p className="text-muted-foreground">
          Mergeable heap where left subtree is always "heavier" (higher NPL). Efficient merge operations.
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
              <div className="text-sm text-muted-foreground">
                Root NPL: {heap.root.npl}
              </div>
            </div>
          )}

          <div className="flex-1 relative bg-white rounded-lg border overflow-hidden min-h-0">
            {!heap.root ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Heap is empty. Insert values to see the leftist structure.
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
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span>Regular node</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-8 bg-blue-500"></div>
              <span>Left path (heavier)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-8 bg-gray-300"></div>
              <span>Right path (lighter)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded-full text-white text-[8px] flex items-center justify-center">N</div>
              <span>NPL value</span>
            </div>
          </div>
          <div className="text-xs space-y-1">
            <div>• Insert: O(log n)</div>
            <div>• Delete Min: O(log n)</div>
            <div>• Merge: O(log n)</div>
            <div>• NPL(left) ≥ NPL(right)</div>
            <div>• Right path is shortest</div>
          </div>
        </div>
      </div>
    </div>
  );
}
