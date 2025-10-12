"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RotateCcw, Search, Shuffle } from "lucide-react";

interface DFSVisualizationProps {
  isPlaying: boolean;
  speed: number;
}

interface GraphNode {
  id: number;
  x: number;
  y: number;
  isVisited: boolean;
  isCurrently: boolean;
  isTarget: boolean;
  isInStack: boolean;
}

interface GraphEdge {
  from: number;
  to: number;
  isTraversed: boolean;
}

export default function DFSVisualization({ speed }: DFSVisualizationProps) {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [startNode, setStartNode] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState("");
  const [visitedOrder, setVisitedOrder] = useState<number[]>([]);
  const [stack, setStack] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState("");

  // Initialize graph
  const initializeGraph = useCallback(() => {
    // Create a simple connected graph
    const newNodes: GraphNode[] = [
      { id: 0, x: 200, y: 100, isVisited: false, isCurrently: false, isTarget: false, isInStack: false },
      { id: 1, x: 100, y: 200, isVisited: false, isCurrently: false, isTarget: false, isInStack: false },
      { id: 2, x: 300, y: 200, isVisited: false, isCurrently: false, isTarget: false, isInStack: false },
      { id: 3, x: 50, y: 300, isVisited: false, isCurrently: false, isTarget: false, isInStack: false },
      { id: 4, x: 150, y: 300, isVisited: false, isCurrently: false, isTarget: false, isInStack: false },
      { id: 5, x: 250, y: 300, isVisited: false, isCurrently: false, isTarget: false, isInStack: false },
      { id: 6, x: 350, y: 300, isVisited: false, isCurrently: false, isTarget: false, isInStack: false },
      { id: 7, x: 100, y: 400, isVisited: false, isCurrently: false, isTarget: false, isInStack: false },
    ];

    const newEdges: GraphEdge[] = [
      { from: 0, to: 1, isTraversed: false },
      { from: 0, to: 2, isTraversed: false },
      { from: 1, to: 3, isTraversed: false },
      { from: 1, to: 4, isTraversed: false },
      { from: 2, to: 5, isTraversed: false },
      { from: 2, to: 6, isTraversed: false },
      { from: 3, to: 7, isTraversed: false },
      { from: 4, to: 7, isTraversed: false },
      { from: 5, to: 6, isTraversed: false },
    ];

    setNodes(newNodes);
    setEdges(newEdges);
    setVisitedOrder([]);
    setStack([]);
    setSearchResult("");
    setCurrentStep("");
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeGraph();
  }, [initializeGraph]);

  // Get adjacent nodes
  const getAdjacent = useCallback((nodeId: number): number[] => {
    const adjacent: number[] = [];
    edges.forEach(edge => {
      if (edge.from === nodeId) adjacent.push(edge.to);
      if (edge.to === nodeId) adjacent.push(edge.from);
    });
    return adjacent.sort(); // Sort for consistent order
  }, [edges]);

  // DFS algorithm
  const depthFirstSearch = useCallback(async (target: number, start: number = startNode) => {
    if (!nodes.length) return;

    setIsSearching(true);
    setSearchResult("");
    setVisitedOrder([]);
    setCurrentStep(`Starting DFS from node ${start}`);

    // Reset all nodes and edges
    setNodes(prev => prev.map(node => ({
      ...node,
      isVisited: false,
      isCurrently: false,
      isTarget: false,
      isInStack: false,
    })));
    setEdges(prev => prev.map(edge => ({ ...edge, isTraversed: false })));

    const visited = new Set<number>();
    const stack = [start];
    const visitOrder: number[] = [];

    setStack([start]);
    setNodes(prev => prev.map(node => ({
      ...node,
      isInStack: node.id === start,
    })));

    await new Promise(resolve => setTimeout(resolve, Math.max(500, 1000 / speed)));

    while (stack.length > 0) {
      const current = stack.pop()!;
      setStack([...stack]);

      if (visited.has(current)) continue;

      // Mark as visited
      visited.add(current);
      visitOrder.push(current);
      setVisitedOrder([...visitOrder]);

      setCurrentStep(`Visiting node ${current}`);
      setNodes(prev => prev.map(node => ({
        ...node,
        isVisited: visited.has(node.id),
        isCurrently: node.id === current,
        isInStack: stack.includes(node.id),
      })));

      await new Promise(resolve => setTimeout(resolve, Math.max(600, 1200 / speed)));

      // Check if we found the target
      if (current === target) {
        setNodes(prev => prev.map(node => ({
          ...node,
          isTarget: node.id === target,
          isCurrently: false,
        })));
        setSearchResult(`Found node ${target}! Visited ${visitOrder.length} nodes.`);
        setCurrentStep(`Target found!`);
        setIsSearching(false);
        return;
      }

      // Add unvisited neighbors to stack (in reverse order for correct DFS behavior)
      const neighbors = getAdjacent(current);
      const unvisitedNeighbors = neighbors.filter(neighbor => !visited.has(neighbor));
      
      // Add in reverse order so we process them in the correct order
      for (let i = unvisitedNeighbors.length - 1; i >= 0; i--) {
        const neighbor = unvisitedNeighbors[i];
        if (!stack.includes(neighbor)) {
          stack.push(neighbor);
          
          // Mark edge as traversed
          setEdges(prev => prev.map(edge => ({
            ...edge,
            isTraversed: edge.isTraversed || 
              (edge.from === current && edge.to === neighbor) ||
              (edge.to === current && edge.from === neighbor)
          })));
        }
      }

      setStack([...stack]);
      setNodes(prev => prev.map(node => ({
        ...node,
        isInStack: stack.includes(node.id),
      })));

      if (unvisitedNeighbors.length > 0) {
        setCurrentStep(`Added neighbors [${unvisitedNeighbors.join(', ')}] to stack`);
      } else {
        setCurrentStep(`No unvisited neighbors, backtracking...`);
      }

      await new Promise(resolve => setTimeout(resolve, Math.max(400, 800 / speed)));
    }

    // Target not found
    setNodes(prev => prev.map(node => ({
      ...node,
      isCurrently: false,
      isInStack: false,
    })));
    setSearchResult(`Node ${target} not found. Visited ${visitOrder.length} nodes.`);
    setCurrentStep(`Search completed`);
    setIsSearching(false);
  }, [nodes, startNode, speed, getAdjacent]);

  const handleSearch = () => {
    const target = parseInt(searchValue);
    if (!isNaN(target) && target >= 0 && target < nodes.length) {
      depthFirstSearch(target);
    }
  };

  const generateRandomGraph = () => {
    if (isSearching) return;

    // Generate random positions
    const newNodes: GraphNode[] = [];
    for (let i = 0; i < 8; i++) {
      newNodes.push({
        id: i,
        x: 50 + Math.random() * 300,
        y: 50 + Math.random() * 300,
        isVisited: false,
        isCurrently: false,
        isTarget: false,
        isInStack: false,
      });
    }

    // Generate random edges (ensure connectivity)
    const newEdges: GraphEdge[] = [];
    const connected = new Set([0]);
    
    // Ensure all nodes are connected
    for (let i = 1; i < newNodes.length; i++) {
      const connectTo = Array.from(connected)[Math.floor(Math.random() * connected.size)];
      newEdges.push({ from: connectTo, to: i, isTraversed: false });
      connected.add(i);
    }

    // Add some additional random edges
    for (let i = 0; i < 5; i++) {
      const from = Math.floor(Math.random() * newNodes.length);
      const to = Math.floor(Math.random() * newNodes.length);
      if (from !== to && !newEdges.some(e => 
        (e.from === from && e.to === to) || (e.from === to && e.to === from)
      )) {
        newEdges.push({ from, to, isTraversed: false });
      }
    }

    setNodes(newNodes);
    setEdges(newEdges);
    setVisitedOrder([]);
    setStack([]);
    setSearchResult("");
    setCurrentStep("");
  };

  return (
    <div className="h-full flex flex-col p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Depth-First Search (DFS)</h2>
        <p className="text-muted-foreground">
          Graph traversal algorithm that explores as far as possible along each branch before backtracking.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex gap-2">
          <Input
            type="number"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Target node (0-7)..."
            className="w-40"
            min="0"
            max="7"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Input
            type="number"
            value={startNode}
            onChange={(e) => setStartNode(parseInt(e.target.value) || 0)}
            placeholder="Start node"
            className="w-32"
            min="0"
            max="7"
          />
          <Button 
            onClick={handleSearch} 
            disabled={!searchValue.trim() || isSearching || !nodes.length}
          >
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={generateRandomGraph} disabled={isSearching} variant="outline">
            <Shuffle className="h-4 w-4 mr-2" />
            Random Graph
          </Button>
          <Button onClick={initializeGraph} disabled={isSearching} variant="outline">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button 
            onClick={() => {
              if (nodes.length > 0) {
                const randomNode = nodes[Math.floor(Math.random() * nodes.length)];
                setSearchValue(randomNode.id.toString());
              }
            }} 
            disabled={isSearching || !nodes.length} 
            variant="outline"
          >
            Demo
          </Button>
        </div>
      </div>

      {/* Graph Visualization */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-2xl bg-muted/20 rounded-lg p-4 mb-4">
          <svg className="w-full h-80" viewBox="0 0 400 450">
            {/* Edges */}
            {edges.map((edge, index) => {
              const fromNode = nodes.find(n => n.id === edge.from);
              const toNode = nodes.find(n => n.id === edge.to);
              if (!fromNode || !toNode) return null;

              return (
                <motion.line
                  key={index}
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke={edge.isTraversed ? "#3b82f6" : "#94a3b8"}
                  strokeWidth={edge.isTraversed ? "3" : "2"}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5 }}
                />
              );
            })}

            {/* Nodes */}
            {nodes.map((node) => (
              <motion.g key={node.id}>
                {/* Node circle */}
                <motion.circle
                  cx={node.x}
                  cy={node.y}
                  r="20"
                  fill={
                    node.isTarget ? "#10b981" :
                    node.isCurrently ? "#f59e0b" :
                    node.isInStack ? "#8b5cf6" :
                    node.isVisited ? "#3b82f6" : "#e2e8f0"
                  }
                  stroke={
                    node.isCurrently ? "#f59e0b" :
                    node.isInStack ? "#8b5cf6" :
                    node.isVisited ? "#3b82f6" : "#64748b"
                  }
                  strokeWidth="2"
                  initial={{ scale: 0 }}
                  animate={{ 
                    scale: node.isCurrently ? 1.3 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                />
                
                {/* Node label */}
                <text
                  x={node.x}
                  y={node.y + 5}
                  textAnchor="middle"
                  className="text-sm font-bold select-none"
                  fill={node.isVisited || node.isCurrently || node.isTarget || node.isInStack ? "white" : "black"}
                >
                  {node.id}
                </text>
              </motion.g>
            ))}
          </svg>
        </div>

        {/* Status */}
        <div className="text-center space-y-2 mb-4">
          {currentStep && (
            <div className="text-lg font-medium text-blue-600">
              {currentStep}
            </div>
          )}
          {searchResult && (
            <div className={`text-lg font-medium ${
              searchResult.includes('Found') ? 'text-green-600' : 'text-red-600'
            }`}>
              {searchResult}
            </div>
          )}
        </div>

        {/* Info Panels in Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
          {/* Stack */}
          <div className="bg-muted/50 rounded-lg p-3">
            <h3 className="font-medium mb-2 text-sm">Stack (LIFO):</h3>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {stack.length === 0 ? (
                <div className="text-xs text-muted-foreground">Empty</div>
              ) : (
                stack.slice().reverse().map((nodeId, index) => (
                  <div 
                    key={index} 
                    className={`text-xs p-1 rounded ${
                      index === 0 ? 'bg-purple-100 text-purple-800 font-medium' : 'bg-gray-100'
                    }`}
                  >
                    Node {nodeId} {index === 0 && '← Top'}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Visited Order */}
          <div className="bg-muted/50 rounded-lg p-3">
            <h3 className="font-medium mb-2 text-sm">Visited Order:</h3>
            <div className="text-xs">
              {visitedOrder.length === 0 ? (
                <div className="text-muted-foreground">None yet</div>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {visitedOrder.map((nodeId, index) => (
                    <span 
                      key={index}
                      className="bg-blue-100 text-blue-800 px-1 py-0.5 rounded text-xs"
                    >
                      {nodeId}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <div className="text-sm font-medium mb-2">Legend:</div>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 border border-gray-400 rounded-full"></div>
            <span>Unvisited</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
            <span>In stack</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
            <span>Currently visiting</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <span>Visited</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span>Target found</span>
          </div>
        </div>
      </div>
    </div>
  );
}