"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, RotateCcw, Shuffle } from "lucide-react";

interface BinomialQueueVisualizationProps {
  speed: number;
}

interface TreeNode {
  value: number;
  children: TreeNode[];
  id: string;
}

interface BinomialTree {
  root: TreeNode;
  order: number;
  id: string;
}

interface QueueState {
  trees: BinomialTree[];
  operations: string[];
  currentOperation: string;
}

export default function BinomialQueueVisualization({ speed }: BinomialQueueVisualizationProps) {
  const [queue, setQueue] = useState<QueueState>({
    trees: [],
    operations: [],
    currentOperation: ""
  });
  const [inputValue, setInputValue] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);

  const createNode = (value: number): TreeNode => ({
    value,
    children: [],
    id: `node-${Date.now()}-${Math.random()}`
  });

  const mergeTrees = (t1: BinomialTree, t2: BinomialTree): BinomialTree => {
    if (t1.root.value <= t2.root.value) {
      return {
        root: {
          ...t1.root,
          children: [...t1.root.children, t2.root]
        },
        order: t1.order + 1,
        id: `tree-${Date.now()}`
      };
    } else {
      return {
        root: {
          ...t2.root,
          children: [...t2.root.children, t1.root]
        },
        order: t2.order + 1,
        id: `tree-${Date.now()}`
      };
    }
  };

  const insert = useCallback(async (value: number) => {
    setIsAnimating(true);
    
    const newTree: BinomialTree = {
      root: createNode(value),
      order: 0,
      id: `tree-${Date.now()}`
    };

    // Get current trees from state
    let currentTrees: BinomialTree[] = [];
    setQueue(prev => {
      currentTrees = prev.trees;
      return {
        ...prev,
        currentOperation: `Inserting ${value} as B₀ tree`,
        operations: [...prev.operations, `Created new B₀ tree with value ${value}`]
      };
    });

    await new Promise(resolve => setTimeout(resolve, Math.max(500, 1000 / speed)));

    let trees = [...currentTrees, newTree].sort((a, b) => a.order - b.order);
    
    // Merge trees of same order
    let i = 0;
    while (i < trees.length - 1) {
      if (trees[i].order === trees[i + 1].order) {
        setQueue(prev => ({
          ...prev,
          currentOperation: `Merging two B₍${trees[i].order}₎ trees`,
          operations: [...prev.operations, `Merging B₍${trees[i].order}₎ trees`]
        }));

        await new Promise(resolve => setTimeout(resolve, Math.max(500, 1000 / speed)));

        const merged = mergeTrees(trees[i], trees[i + 1]);
        trees = [...trees.slice(0, i), merged, ...trees.slice(i + 2)];
        trees.sort((a, b) => a.order - b.order);
      } else {
        i++;
      }
    }

    setQueue(prev => ({
      ...prev,
      trees,
      currentOperation: ""
    }));

    setIsAnimating(false);
  }, [speed]);

  const findMinTree = (trees: BinomialTree[]): number => {
    if (trees.length === 0) return -1;
    let minIndex = 0;
    for (let i = 1; i < trees.length; i++) {
      if (trees[i].root.value < trees[minIndex].root.value) {
        minIndex = i;
      }
    }
    return minIndex;
  };

  const deleteMin = useCallback(async () => {
    // Get current trees from state
    let currentTrees: BinomialTree[] = [];
    setQueue(prev => {
      currentTrees = prev.trees;
      return prev;
    });

    if (currentTrees.length === 0) return;

    setIsAnimating(true);

    const minIndex = findMinTree(currentTrees);
    const minTree = currentTrees[minIndex];
    const minValue = minTree.root.value;

    setQueue(prev => ({
      ...prev,
      currentOperation: `Removing minimum value ${minValue}`,
      operations: [...prev.operations, `Found minimum: ${minValue} in B₍${minTree.order}₎`]
    }));

    await new Promise(resolve => setTimeout(resolve, Math.max(500, 1000 / speed)));

    // Remove min tree and create new trees from its children
    const remainingTrees = currentTrees.filter((_, i) => i !== minIndex);
    const childTrees: BinomialTree[] = minTree.root.children.map((child, idx) => ({
      root: child,
      order: idx,
      id: `tree-${Date.now()}-${idx}`
    })).reverse();

    let trees = [...remainingTrees, ...childTrees].sort((a, b) => a.order - b.order);

    // Merge trees of same order
    let i = 0;
    while (i < trees.length - 1) {
      if (trees[i].order === trees[i + 1].order) {
        const merged = mergeTrees(trees[i], trees[i + 1]);
        trees = [...trees.slice(0, i), merged, ...trees.slice(i + 2)];
        trees.sort((a, b) => a.order - b.order);
      } else {
        i++;
      }
    }

    setQueue(prev => ({
      ...prev,
      trees,
      currentOperation: ""
    }));

    setIsAnimating(false);
  }, [speed]);

  const renderTree = (node: TreeNode, x: number, y: number, level: number = 0): React.ReactElement[] => {
    const elements: React.ReactElement[] = [];
    const nodeRadius = 18;
    const verticalSpacing = 50;

    // For binomial trees, children are arranged vertically below
    node.children.forEach((child, idx) => {
      const childX = x + 45; // Move to the right
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
      
      elements.push(...renderTree(child, childX, childY, level + 1));
    });

    // Draw node
    elements.push(
      <g key={node.id}>
        <circle
          cx={x}
          cy={y}
          r={nodeRadius}
          fill={level === 0 ? "#10b981" : "#3b82f6"}
          stroke={level === 0 ? "#059669" : "#2563eb"}
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
    
    setQueue({ trees: [], operations: [], currentOperation: "" });
    
    const sampleValues = [5, 15, 10, 20, 8, 25, 12];
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    for (const value of sampleValues) {
      await insert(value);
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  };

  const clear = () => {
    if (isAnimating) return;
    setQueue({ trees: [], operations: [], currentOperation: "" });
  };

  const minValue = queue.trees.length > 0 
    ? queue.trees[findMinTree(queue.trees)]?.root.value 
    : null;

  return (
    <div className="h-full flex flex-col p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Binomial Queue</h2>
        <p className="text-muted-foreground">
          Collection of binomial trees where each tree follows min-heap property. Trees of order k have 2^k nodes.
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
            disabled={queue.trees.length === 0 || isAnimating}
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

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        {/* Visualization */}
        <div className="flex-1 flex flex-col min-h-0">
          {queue.currentOperation && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm font-medium text-blue-800">
                {queue.currentOperation}
              </div>
            </div>
          )}

          {minValue !== null && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <div className="bg-green-100 text-green-800 px-3 py-2 rounded-lg font-medium text-sm">
                Minimum: {minValue}
              </div>
              <div className="text-sm text-muted-foreground">
                Trees: {queue.trees.length} | Total nodes: {queue.trees.reduce((sum, t) => sum + Math.pow(2, t.order), 0)}
              </div>
            </div>
          )}

          <div className="flex-1 relative bg-white rounded-lg border overflow-hidden min-h-0">
            {queue.trees.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Queue is empty. Insert values to see binomial trees.
              </div>
            ) : (
              <div className="h-full overflow-auto p-4">
                <div className="flex gap-6 items-start pb-4">
                  <AnimatePresence>
                    {queue.trees.map((tree) => {
                      const treeHeight = Math.max(200, (tree.order + 1) * 50 + 80);
                      const treeWidth = Math.max(100, (tree.order + 1) * 45 + 40);
                      
                      return (
                        <motion.div
                          key={tree.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="flex-shrink-0"
                        >
                          <div className="text-center mb-2">
                            <div className="text-sm font-semibold text-gray-700">
                              B₍{tree.order}₎
                            </div>
                            <div className="text-xs text-gray-500">
                              {Math.pow(2, tree.order)} node{Math.pow(2, tree.order) !== 1 ? 's' : ''}
                            </div>
                          </div>
                          <svg 
                            width={treeWidth} 
                            height={treeHeight}
                            viewBox={`0 0 ${treeWidth} ${treeHeight}`}
                          >
                            {renderTree(tree.root, 30, 30)}
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
        <div className="lg:w-80 w-full bg-muted/50 rounded-lg p-4 lg:max-h-full max-h-64 overflow-hidden flex flex-col">
          <h3 className="font-medium mb-3">Operations Log:</h3>
          <div className="space-y-2 overflow-y-auto flex-1">
            {queue.operations.map((operation, index) => (
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
        <div className="text-sm font-medium mb-2">Properties:</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>• B₀ has 1 node</div>
          <div>• B₍k₎ has 2^k nodes</div>
          <div>• Insert: O(log n)</div>
          <div>• Delete Min: O(log n)</div>
          <div>• Find Min: O(log n)</div>
          <div>• Merge: O(log n)</div>
        </div>
      </div>
    </div>
  );
}
