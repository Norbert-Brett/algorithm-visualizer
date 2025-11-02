"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Trash2, RotateCcw, Shuffle, ArrowUp, ArrowDown } from "lucide-react";

interface BinaryHeapVisualizationProps {
  speed: number;
}

interface HeapNode {
  value: number;
  id: string;
  isActive: boolean;
  isComparing: boolean;
  isSwapping: boolean;
}

interface HeapState {
  nodes: HeapNode[];
  heapType: "min" | "max";
  operations: string[];
  currentOperation: string;
}

export default function BinaryHeapVisualization({ speed }: BinaryHeapVisualizationProps) {
  const [heap, setHeap] = useState<HeapState>({
    nodes: [],
    heapType: "min",
    operations: [],
    currentOperation: ""
  });
  const [inputValue, setInputValue] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [viewMode, setViewMode] = useState<"tree" | "array">("tree");

  // Calculate tree positions for visualization
  const calculateTreePositions = useCallback((nodes: HeapNode[]) => {
    const positions: { x: number; y: number; level: number }[] = [];
    
    for (let i = 0; i < nodes.length; i++) {
      const level = Math.floor(Math.log2(i + 1));
      const positionInLevel = i - (Math.pow(2, level) - 1);
      const maxNodesInLevel = Math.pow(2, level);
      
      // Calculate x position (centered in level)
      const levelWidth = 800;
      const nodeSpacing = levelWidth / (maxNodesInLevel + 1);
      const x = nodeSpacing * (positionInLevel + 1);
      
      // Calculate y position
      const y = level * 80 + 50;
      
      positions.push({ x, y, level });
    }
    
    return positions;
  }, []);

  // Helper functions for heap operations
  const getParentIndex = (index: number) => Math.floor((index - 1) / 2);
  const getLeftChildIndex = (index: number) => 2 * index + 1;
  const getRightChildIndex = (index: number) => 2 * index + 2;

  const shouldSwap = (parentValue: number, childValue: number, heapType: "min" | "max") => {
    return heapType === "min" ? parentValue > childValue : parentValue < childValue;
  };

  // Initialize heap
  const initializeHeap = useCallback(() => {
    setHeap({
      nodes: [],
      heapType: heap.heapType,
      operations: [],
      currentOperation: ""
    });
  }, [heap.heapType]);

  // Heapify up (bubble up)
  const heapifyUp = useCallback(async (nodes: HeapNode[], startIndex: number, heapType: "min" | "max") => {
    let currentIndex = startIndex;
    const newNodes = [...nodes];
    
    while (currentIndex > 0) {
      const parentIndex = getParentIndex(currentIndex);
      
      // Highlight comparing nodes
      newNodes[currentIndex].isComparing = true;
      newNodes[parentIndex].isComparing = true;
      
      setHeap(prev => ({
        ...prev,
        nodes: newNodes,
        currentOperation: `Comparing ${newNodes[currentIndex].value} with parent ${newNodes[parentIndex].value}`
      }));
      
      await new Promise(resolve => setTimeout(resolve, Math.max(500, 1000 / speed)));
      
      if (!shouldSwap(newNodes[parentIndex].value, newNodes[currentIndex].value, heapType)) {
        // No swap needed, heap property satisfied
        newNodes[currentIndex].isComparing = false;
        newNodes[parentIndex].isComparing = false;
        break;
      }
      
      // Swap nodes
      newNodes[currentIndex].isSwapping = true;
      newNodes[parentIndex].isSwapping = true;
      
      setHeap(prev => ({
        ...prev,
        operations: [...prev.operations, `Swapping ${newNodes[currentIndex].value} with ${newNodes[parentIndex].value}`]
      }));
      
      await new Promise(resolve => setTimeout(resolve, Math.max(500, 1000 / speed)));
      
      // Perform the swap
      const temp = newNodes[currentIndex].value;
      newNodes[currentIndex].value = newNodes[parentIndex].value;
      newNodes[parentIndex].value = temp;
      
      // Reset highlighting
      newNodes[currentIndex].isComparing = false;
      newNodes[currentIndex].isSwapping = false;
      newNodes[parentIndex].isComparing = false;
      newNodes[parentIndex].isSwapping = false;
      
      currentIndex = parentIndex;
    }
    
    return newNodes;
  }, [speed]);

  // Heapify down (bubble down)
  const heapifyDown = useCallback(async (nodes: HeapNode[], startIndex: number, heapType: "min" | "max") => {
    let currentIndex = startIndex;
    const newNodes = [...nodes];
    
    while (true) {
      const leftChildIndex = getLeftChildIndex(currentIndex);
      const rightChildIndex = getRightChildIndex(currentIndex);
      let targetIndex = currentIndex;
      
      // Find the target index to swap with
      if (leftChildIndex < newNodes.length) {
        if (shouldSwap(newNodes[targetIndex].value, newNodes[leftChildIndex].value, heapType)) {
          targetIndex = leftChildIndex;
        }
      }
      
      if (rightChildIndex < newNodes.length) {
        if (shouldSwap(newNodes[targetIndex].value, newNodes[rightChildIndex].value, heapType)) {
          targetIndex = rightChildIndex;
        }
      }
      
      if (targetIndex === currentIndex) {
        // No swap needed, heap property satisfied
        break;
      }
      
      // Highlight comparing nodes
      newNodes[currentIndex].isComparing = true;
      newNodes[targetIndex].isComparing = true;
      
      setHeap(prev => ({
        ...prev,
        nodes: newNodes,
        currentOperation: `Comparing ${newNodes[currentIndex].value} with child ${newNodes[targetIndex].value}`
      }));
      
      await new Promise(resolve => setTimeout(resolve, Math.max(500, 1000 / speed)));
      
      // Swap nodes
      newNodes[currentIndex].isSwapping = true;
      newNodes[targetIndex].isSwapping = true;
      
      setHeap(prev => ({
        ...prev,
        operations: [...prev.operations, `Swapping ${newNodes[currentIndex].value} with ${newNodes[targetIndex].value}`]
      }));
      
      await new Promise(resolve => setTimeout(resolve, Math.max(500, 1000 / speed)));
      
      // Perform the swap
      const temp = newNodes[currentIndex].value;
      newNodes[currentIndex].value = newNodes[targetIndex].value;
      newNodes[targetIndex].value = temp;
      
      // Reset highlighting
      newNodes[currentIndex].isComparing = false;
      newNodes[currentIndex].isSwapping = false;
      newNodes[targetIndex].isComparing = false;
      newNodes[targetIndex].isSwapping = false;
      
      currentIndex = targetIndex;
    }
    
    return newNodes;
  }, [speed]);

  // Insert operation
  const insert = useCallback(async (value: number) => {
    setIsAnimating(true);
    
    // Use functional state update to get the current state
    let currentNodes: HeapNode[] = [];
    let newIndex = 0;
    let currentHeapType: "min" | "max" = "min";
    
    setHeap(prev => {
      currentNodes = prev.nodes;
      newIndex = prev.nodes.length;
      currentHeapType = prev.heapType;
      
      const newNode: HeapNode = {
        value,
        id: `node-${Date.now()}`,
        isActive: true,
        isComparing: false,
        isSwapping: false
      };
      
      const nodesWithNewNode = [...prev.nodes, newNode];
      
      return {
        ...prev,
        nodes: nodesWithNewNode,
        currentOperation: `Inserting ${value} at the end of heap`,
        operations: [...prev.operations, `Added ${value} at index ${newIndex}`]
      };
    });
    
    await new Promise(resolve => setTimeout(resolve, Math.max(500, 1000 / speed)));
    
    // Get the updated nodes array for heapify
    const nodesWithNewNode = [...currentNodes, {
      value,
      id: `node-${Date.now()}`,
      isActive: true,
      isComparing: false,
      isSwapping: false
    }];
    
    // Heapify up using the correct array and heap type
    const updatedNodes = await heapifyUp(nodesWithNewNode, newIndex, currentHeapType);
    
    // Reset active state
    const finalNodes = updatedNodes.map((node) => ({
      ...node,
      isActive: false
    }));
    
    setHeap(prev => ({
      ...prev,
      nodes: finalNodes,
      currentOperation: ""
    }));
    
    setIsAnimating(false);
  }, [heapifyUp, speed]);

  // Extract (remove root) operation
  const extractRoot = useCallback(async () => {
    if (heap.nodes.length === 0) return;
    
    setIsAnimating(true);
    
    const rootValue = heap.nodes[0].value;
    
    if (heap.nodes.length === 1) {
      // Only one element, just remove it
      setHeap(prev => ({
        ...prev,
        nodes: [],
        operations: [...prev.operations, `Extracted root ${rootValue}`],
        currentOperation: ""
      }));
      setIsAnimating(false);
      return;
    }
    
    // Move last element to root
    const newNodes = [...heap.nodes];
    newNodes[0].value = newNodes[newNodes.length - 1].value;
    newNodes[0].isActive = true;
    newNodes.pop(); // Remove last element
    
    setHeap(prev => ({
      ...prev,
      nodes: newNodes,
      currentOperation: `Extracted root ${rootValue}, moved last element to root`,
      operations: [...prev.operations, `Extracted root ${rootValue}`]
    }));
    
    await new Promise(resolve => setTimeout(resolve, Math.max(500, 1000 / speed)));
    
    // Heapify down from root
    const updatedNodes = await heapifyDown(newNodes, 0, heap.heapType);
    
    // Reset active state
    const finalNodes = updatedNodes.map((node) => ({
      ...node,
      isActive: false
    }));
    
    setHeap(prev => ({
      ...prev,
      nodes: finalNodes,
      currentOperation: ""
    }));
    
    setIsAnimating(false);
  }, [heap.nodes, heap.heapType, heapifyDown, speed]);

  const handleInsert = () => {
    const value = parseInt(inputValue);
    if (!isNaN(value)) {
      insert(value);
      setInputValue("");
    }
  };

  const handleHeapTypeChange = (newType: "min" | "max") => {
    if (isAnimating) return;
    setHeap(prev => ({ ...prev, heapType: newType }));
  };

  const generateSampleData = useCallback(async () => {
    if (isAnimating) return;
    
    // Clear the heap first
    setHeap(prev => ({
      ...prev,
      nodes: [],
      operations: [],
      currentOperation: ""
    }));
    
    const sampleValues = [10, 20, 15, 30, 40, 50, 100, 25, 45];
    
    // Wait a bit for the clear to take effect
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Insert values sequentially
    for (let i = 0; i < sampleValues.length; i++) {
      await insert(sampleValues[i]);
      // Wait between insertions to see the animation
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }, [isAnimating, insert]);

  // Calculate positions for rendering (no useEffect needed)
  const positions = calculateTreePositions(heap.nodes);
  const nodesWithPositions = heap.nodes.map((node, index) => ({
    ...node,
    index,
    x: positions[index]?.x || 0,
    y: positions[index]?.y || 0,
    level: positions[index]?.level || 0
  }));

  return (
    <div className="h-full flex flex-col p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Binary Heap</h2>
        <p className="text-muted-foreground">
          Complete binary tree that satisfies the heap property. Min-heap: parent ≤ children, Max-heap: parent ≥ children.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-32">
                {heap.heapType === "min" ? "Min Heap" : "Max Heap"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleHeapTypeChange("min")}>
                Min Heap
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleHeapTypeChange("max")}>
                Max Heap
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-32">
                {viewMode === "tree" ? "Tree View" : "Array View"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setViewMode("tree")}>
                Tree View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setViewMode("array")}>
                Array View
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
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
            onClick={extractRoot} 
            disabled={heap.nodes.length === 0 || isAnimating}
            variant="destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Extract {heap.heapType === "min" ? "Min" : "Max"}
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={() => generateSampleData()} disabled={isAnimating} variant="outline">
            <Shuffle className="h-4 w-4 mr-2" />
            Sample Data
          </Button>
          <Button onClick={initializeHeap} disabled={isAnimating} variant="outline">
            <RotateCcw className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>

      <div className="flex-1 flex gap-6">
        {/* Heap Visualization */}
        <div className="flex-1 flex flex-col">
          {/* Current Operation */}
          {heap.currentOperation && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm font-medium text-blue-800">
                {heap.currentOperation}
              </div>
            </div>
          )}

          {/* Heap Type Indicator */}
          <div className="mb-4 flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
              heap.heapType === "min" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}>
              {heap.heapType === "min" ? <ArrowDown className="h-4 w-4" /> : <ArrowUp className="h-4 w-4" />}
              <span className="font-medium">{heap.heapType.toUpperCase()} HEAP</span>
            </div>
            {heap.nodes.length > 0 && (
              <div className="text-sm text-muted-foreground">
                Root: {heap.nodes[0]?.value} | Size: {heap.nodes.length}
              </div>
            )}
          </div>

          {/* Visualization Area */}
          <div className="flex-1 relative overflow-hidden bg-white rounded-lg border">
            {heap.nodes.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Heap is empty. Insert some values to see the visualization.
              </div>
            ) : viewMode === "tree" ? (
              /* Tree View */
              <div className="relative w-full h-full overflow-auto">
                <svg className="w-full h-full min-h-96" viewBox="0 0 900 600">
                  {/* Edges */}
                  {nodesWithPositions.map((node, index) => {
                    const leftChildIndex = getLeftChildIndex(index);
                    const rightChildIndex = getRightChildIndex(index);
                    const edges = [];
                    
                    if (leftChildIndex < nodesWithPositions.length) {
                      const leftChild = nodesWithPositions[leftChildIndex];
                      edges.push(
                        <line
                          key={`edge-left-${index}`}
                          x1={node.x}
                          y1={node.y}
                          x2={leftChild.x}
                          y2={leftChild.y}
                          stroke="#e5e7eb"
                          strokeWidth="2"
                        />
                      );
                    }
                    
                    if (rightChildIndex < nodesWithPositions.length) {
                      const rightChild = nodesWithPositions[rightChildIndex];
                      edges.push(
                        <line
                          key={`edge-right-${index}`}
                          x1={node.x}
                          y1={node.y}
                          x2={rightChild.x}
                          y2={rightChild.y}
                          stroke="#e5e7eb"
                          strokeWidth="2"
                        />
                      );
                    }
                    
                    return edges;
                  })}
                  
                  {/* Nodes */}
                  <AnimatePresence>
                    {nodesWithPositions.map((node, index) => (
                      <motion.g
                        key={node.id}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ 
                          opacity: 1, 
                          scale: node.isSwapping ? 1.2 : 1,
                          x: node.x,
                          y: node.y
                        }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <circle
                          cx={0}
                          cy={0}
                          r="25"
                          fill={
                            node.isActive ? "#3b82f6" :
                            node.isComparing ? "#f59e0b" :
                            node.isSwapping ? "#ef4444" :
                            index === 0 ? (heap.heapType === "min" ? "#10b981" : "#ef4444") :
                            "#e5e7eb"
                          }
                          stroke={
                            node.isComparing || node.isSwapping ? "#ffffff" : "#9ca3af"
                          }
                          strokeWidth="2"
                        />
                        <text
                          x={0}
                          y={5}
                          textAnchor="middle"
                          className={`text-sm font-bold ${
                            node.isActive || node.isComparing || node.isSwapping || index === 0
                              ? "fill-white" 
                              : "fill-gray-700"
                          }`}
                        >
                          {node.value}
                        </text>
                        <text
                          x={0}
                          y={-35}
                          textAnchor="middle"
                          className="text-xs fill-gray-500"
                        >
                          {index}
                        </text>
                      </motion.g>
                    ))}
                  </AnimatePresence>
                </svg>
              </div>
            ) : (
              /* Array View */
              <div className="p-6 flex flex-col justify-center">
                <div className="mb-4 text-sm font-medium text-gray-600">Array Representation:</div>
                <div className="flex gap-1 flex-wrap justify-center">
                  {heap.nodes.map((node, index) => (
                    <motion.div
                      key={node.id}
                      className={`
                        w-16 h-16 flex flex-col items-center justify-center rounded border-2 font-bold text-sm
                        ${node.isActive ? 'bg-blue-500 border-blue-600 text-white' :
                          node.isComparing ? 'bg-orange-500 border-orange-600 text-white' :
                          node.isSwapping ? 'bg-red-500 border-red-600 text-white' :
                          index === 0 ? (heap.heapType === "min" ? 'bg-green-500 border-green-600 text-white' : 'bg-red-500 border-red-600 text-white') :
                          'bg-gray-100 border-gray-300 text-gray-700'
                        }
                      `}
                      animate={{ 
                        scale: node.isSwapping ? 1.1 : 1,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <div>{node.value}</div>
                      <div className="text-xs opacity-75">[{index}]</div>
                    </motion.div>
                  ))}
                </div>
                
                {/* Parent-Child relationships */}
                {heap.nodes.length > 0 && (
                  <div className="mt-6 text-xs text-gray-600">
                    <div className="mb-2 font-medium">Array Index Relationships:</div>
                    <div className="space-y-1">
                      <div>• Parent of index i: ⌊(i-1)/2⌋</div>
                      <div>• Left child of index i: 2i+1</div>
                      <div>• Right child of index i: 2i+2</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Operations Log */}
        <div className="w-80 bg-muted/50 rounded-lg p-4">
          <h3 className="font-medium mb-3">Operations Log:</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {heap.operations.map((operation, index) => (
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
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span>Root (Min Heap)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span>Root (Max Heap)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <span>New node</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
            <span>Comparing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span>Swapping</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
            <span>Regular node</span>
          </div>
        </div>
      </div>
    </div>
  );
}