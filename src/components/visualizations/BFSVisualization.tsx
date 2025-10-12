"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, RotateCcw, Shuffle } from "lucide-react";

interface BFSVisualizationProps {
  speed: number;
}

interface GraphNode {
  id: number;
  x: number;
  y: number;
  isVisited: boolean;
  isCurrently: boolean;
  isTarget: boolean;
  isInQueue: boolean;
  distance: number;
}

interface GraphEdge {
  from: number;
  to: number;
  isTraversed: boolean;
}

export default function BFSVisualization({ speed }: BFSVisualizationProps) {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [startNode, setStartNode] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState("");
  const [visitedOrder, setVisitedOrder] = useState<number[]>([]);
  const [queue, setQueue] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState("");

  // Initialize graph
  const initializeGraph = useCallback(() => {
    // Create a simple connected graph with level structure
    const newNodes: GraphNode[] = [
      { id: 0, x: 200, y: 50, isVisited: false, isCurrently: false, isTarget: false, isInQueue: false, distance: -1 },
      { id: 1, x: 100, y: 150, isVisited: false, isCurrently: false, isTarget: false, isInQueue: false, distance: -1 },
      { id: 2, x: 300, y: 150, isVisited: false, isCurrently: false, isTarget: false, isInQueue: false, distance: -1 },
      { id: 3, x: 50, y: 250, isVisited: false, isCurrently: false, isTarget: false, isInQueue: false, distance: -1 },
      { id: 4, x: 150, y: 250, isVisited: false, isCurrently: false, isTarget: false, isInQueue: false, distance: -1 },
      { id: 5, x: 250, y: 250, isVisited: false, isCurrently: false, isTarget: false, isInQueue: false, distance: -1 },
      { id: 6, x: 350, y: 250, isVisited: false, isCurrently: false, isTarget: false, isInQueue: false, distance: -1 },
      { id: 7, x: 100, y: 350, isVisited: false, isCurrently: false, isTarget: false, isInQueue: false, distance: -1 },
      { id: 8, x: 300, y: 350, isVisited: false, isCurrently: false, isTarget: false, isInQueue: false, distance: -1 },
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
      { from: 5, to: 8, isTraversed: false },
      { from: 6, to: 8, isTraversed: false },
      { from: 4, to: 5, isTraversed: false }, // Cross connection
    ];

    setNodes(newNodes);
    setEdges(newEdges);
    setVisitedOrder([]);
    setQueue([]);
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
    edges.forEach((edge) => {
      if (edge.from === nodeId) adjacent.push(edge.to);
      if (edge.to === nodeId) adjacent.push(edge.from);
    });
    return adjacent.sort(); // Sort for consistent order
  }, [edges]);

  // BFS algorithm
  const breadthFirstSearch = useCallback(async (target: number, start: number = startNode) => {
    if (!nodes.length) return;

    setIsSearching(true);
    setSearchResult("");
    setVisitedOrder([]);
    setCurrentStep(`Starting BFS from node ${start}`);

    // Reset all nodes and edges
    setNodes((prev) =>
      prev.map((node) => ({
        ...node,
        isVisited: false,
        isCurrently: false,
        isTarget: false,
        isInQueue: false,
        distance: node.id === start ? 0 : -1,
      }))
    );
    setEdges((prev) => prev.map((edge) => ({ ...edge, isTraversed: false })));

    const visited = new Set<number>();
    const queue = [start];
    const visitOrder: number[] = [];
    const distances: { [key: number]: number } = { [start]: 0 };

    setQueue([start]);
    setNodes((prev) =>
      prev.map((node) => ({
        ...node,
        isInQueue: node.id === start,
        distance: node.id === start ? 0 : -1,
      }))
    );

    await new Promise((resolve) => setTimeout(resolve, Math.max(500, 1000 / speed)));

    while (queue.length > 0) {
      const current = queue.shift()!;
      setQueue([...queue]);

      if (visited.has(current)) continue;

      // Mark as visited
      visited.add(current);
      visitOrder.push(current);
      setVisitedOrder([...visitOrder]);

      setCurrentStep(`Visiting node ${current} (distance: ${distances[current]})`);
      setNodes((prev) =>
        prev.map((node) => ({
          ...node,
          isVisited: visited.has(node.id),
          isCurrently: node.id === current,
          isInQueue: queue.includes(node.id),
          distance: distances[node.id] ?? -1,
        }))
      );

      await new Promise((resolve) => setTimeout(resolve, Math.max(600, 1200 / speed)));

      // Check if we found the target
      if (current === target) {
        setNodes((prev) =>
          prev.map((node) => ({
            ...node,
            isTarget: node.id === target,
            isCurrently: false,
          }))
        );
        setSearchResult(`Found node ${target} at distance ${distances[current]}! Visited ${visitOrder.length} nodes.`);
        setCurrentStep(`Target found at distance ${distances[current]}!`);
        setIsSearching(false);
        return;
      }

      // Add unvisited neighbors to queue
      const neighbors = getAdjacent(current);
      const unvisitedNeighbors = neighbors.filter(
        (neighbor) => !visited.has(neighbor) && !queue.includes(neighbor)
      );

      for (const neighbor of unvisitedNeighbors) {
        queue.push(neighbor);
        distances[neighbor] = distances[current] + 1;

        // Mark edge as traversed
        setEdges((prev) =>
          prev.map((edge) => ({
            ...edge,
            isTraversed:
              edge.isTraversed ||
              (edge.from === current && edge.to === neighbor) ||
              (edge.to === current && edge.from === neighbor),
          }))
        );
      }

      setQueue([...queue]);
      setNodes((prev) =>
        prev.map((node) => ({
          ...node,
          isInQueue: queue.includes(node.id),
          distance: distances[node.id] ?? -1,
        }))
      );

      if (unvisitedNeighbors.length > 0) {
        setCurrentStep(`Added neighbors [${unvisitedNeighbors.join(", ")}] to queue`);
      } else {
        setCurrentStep(`No new neighbors to add`);
      }

      await new Promise((resolve) => setTimeout(resolve, Math.max(400, 800 / speed)));
    }

    // Target not found
    setNodes((prev) =>
      prev.map((node) => ({
        ...node,
        isCurrently: false,
        isInQueue: false,
      }))
    );
    setSearchResult(`Node ${target} not found. Visited ${visitOrder.length} nodes.`);
    setCurrentStep(`Search completed - target not reachable`);
    setIsSearching(false);
  }, [nodes, startNode, speed, getAdjacent]);

  const handleSearch = () => {
    const target = parseInt(searchValue);
    if (!isNaN(target) && target >= 0 && target < nodes.length) {
      breadthFirstSearch(target);
    }
  };

  const generateRandomGraph = () => {
    if (isSearching) return;

    // Generate random positions in a more structured way for BFS
    const newNodes: GraphNode[] = [];
    const levels = 4;
    const nodesPerLevel = [1, 2, 3, 3];
    let nodeId = 0;

    for (let level = 0; level < levels; level++) {
      const y = 50 + level * 100;
      const nodeCount = nodesPerLevel[level];
      const spacing = 400 / (nodeCount + 1);

      for (let i = 0; i < nodeCount && nodeId < 9; i++) {
        newNodes.push({
          id: nodeId++,
          x: spacing * (i + 1),
          y: y + Math.random() * 20 - 10, // Small random offset
          isVisited: false,
          isCurrently: false,
          isTarget: false,
          isInQueue: false,
          distance: -1,
        });
      }
    }

    // Generate edges to create a connected graph
    const newEdges: GraphEdge[] = [];
    const connected = new Set([0]);

    // Connect each node to at least one node in the previous level
    for (let i = 1; i < newNodes.length; i++) {
      const connectTo = Array.from(connected)[Math.floor(Math.random() * connected.size)];
      newEdges.push({ from: connectTo, to: i, isTraversed: false });
      connected.add(i);
    }

    // Add some additional random edges within levels and between adjacent levels
    for (let i = 0; i < 6; i++) {
      const from = Math.floor(Math.random() * newNodes.length);
      const to = Math.floor(Math.random() * newNodes.length);
      if (
        from !== to &&
        !newEdges.some((e) => (e.from === from && e.to === to) || (e.from === to && e.to === from))
      ) {
        newEdges.push({ from, to, isTraversed: false });
      }
    }

    setNodes(newNodes);
    setEdges(newEdges);
    setVisitedOrder([]);
    setQueue([]);
    setSearchResult("");
    setCurrentStep("");
  };

  return (
    <div className="h-full flex flex-col p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Breadth-First Search (BFS)</h2>
        <p className="text-muted-foreground">
          Graph traversal algorithm that explores all neighbors at the current depth before moving to nodes at the next depth level.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex gap-2">
          <Input
            type="number"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Target node (0-8)..."
            className="w-40"
            min="0"
            max="8"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Input
            type="number"
            value={startNode}
            onChange={(e) => setStartNode(parseInt(e.target.value) || 0)}
            placeholder="Start node"
            className="w-32"
            min="0"
            max="8"
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
          <svg className="w-full h-80" viewBox="0 0 400 400">
            {/* Edges */}
            {edges.map((edge, index) => {
              const fromNode = nodes.find((n) => n.id === edge.from);
              const toNode = nodes.find((n) => n.id === edge.to);
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
                {/* Distance ring for visited nodes */}
                {node.distance >= 0 && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="28"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                    opacity="0.5"
                  />
                )}

                {/* Node circle */}
                <motion.circle
                  cx={node.x}
                  cy={node.y}
                  r="20"
                  fill={
                    node.isTarget
                      ? "#10b981"
                      : node.isCurrently
                      ? "#f59e0b"
                      : node.isInQueue
                      ? "#8b5cf6"
                      : node.isVisited
                      ? "#3b82f6"
                      : "#e2e8f0"
                  }
                  stroke={
                    node.isCurrently
                      ? "#f59e0b"
                      : node.isInQueue
                      ? "#8b5cf6"
                      : node.isVisited
                      ? "#3b82f6"
                      : "#64748b"
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
                  fill={
                    node.isVisited || node.isCurrently || node.isTarget || node.isInQueue ? "white" : "black"
                  }
                >
                  {node.id}
                </text>

                {/* Distance label */}
                {node.distance >= 0 && (
                  <text
                    x={node.x}
                    y={node.y - 30}
                    textAnchor="middle"
                    className="text-xs font-medium select-none"
                    fill="#3b82f6"
                  >
                    d:{node.distance}
                  </text>
                )}
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
            <div className={`text-lg font-medium ${searchResult.includes("Found") ? "text-green-600" : "text-red-600"}`}>
              {searchResult}
            </div>
          )}
        </div>

        {/* Info Panels in Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl">
          {/* Queue */}
          <div className="bg-muted/50 rounded-lg p-3">
            <h3 className="font-medium mb-2 text-sm">Queue (FIFO):</h3>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {queue.length === 0 ? (
                <div className="text-xs text-muted-foreground">Empty</div>
              ) : (
                queue.map((nodeId, index) => (
                  <div
                    key={index}
                    className={`text-xs p-1 rounded ${
                      index === 0 ? "bg-purple-100 text-purple-800 font-medium" : "bg-gray-100"
                    }`}
                  >
                    Node {nodeId} {index === 0 && "← Front"}
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
                    <span key={index} className="bg-blue-100 text-blue-800 px-1 py-0.5 rounded text-xs">
                      {nodeId}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* BFS Properties */}
          <div className="bg-muted/50 rounded-lg p-3">
            <h3 className="font-medium mb-2 text-sm">BFS Properties:</h3>
            <div className="text-xs space-y-1">
              <div>• Finds shortest path</div>
              <div>• Level-by-level exploration</div>
              <div>• Uses queue (FIFO)</div>
              <div>• Time: O(V + E)</div>
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
            <span>In queue</span>
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
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 border border-blue-500 rounded-full"></div>
            <span>Distance indicator</span>
          </div>
        </div>
      </div>
    </div>
  );
}