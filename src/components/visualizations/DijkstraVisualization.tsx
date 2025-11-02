"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, RotateCcw, Shuffle } from "lucide-react";

interface DijkstraVisualizationProps {
  speed: number;
}

interface GraphNode {
  id: number;
  x: number;
  y: number;
  distance: number;
  isVisited: boolean;
  isCurrently: boolean;
  isTarget: boolean;
  isInQueue: boolean;
  previous: number | null;
}

interface GraphEdge {
  from: number;
  to: number;
  weight: number;
  isInPath: boolean;
  isRelaxed: boolean;
}

export default function DijkstraVisualization({ speed }: DijkstraVisualizationProps) {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [startNode, setStartNode] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState("");
  const [visitedOrder, setVisitedOrder] = useState<number[]>([]);
  const [priorityQueue, setPriorityQueue] = useState<{id: number, distance: number}[]>([]);
  const [currentStep, setCurrentStep] = useState("");


  // Initialize graph with weighted edges
  const initializeGraph = useCallback(() => {
    const newNodes: GraphNode[] = [
      { id: 0, x: 100, y: 100, distance: -1, isVisited: false, isCurrently: false, isTarget: false, isInQueue: false, previous: null },
      { id: 1, x: 300, y: 100, distance: -1, isVisited: false, isCurrently: false, isTarget: false, isInQueue: false, previous: null },
      { id: 2, x: 500, y: 100, distance: -1, isVisited: false, isCurrently: false, isTarget: false, isInQueue: false, previous: null },
      { id: 3, x: 100, y: 250, distance: -1, isVisited: false, isCurrently: false, isTarget: false, isInQueue: false, previous: null },
      { id: 4, x: 300, y: 250, distance: -1, isVisited: false, isCurrently: false, isTarget: false, isInQueue: false, previous: null },
      { id: 5, x: 500, y: 250, distance: -1, isVisited: false, isCurrently: false, isTarget: false, isInQueue: false, previous: null },
      { id: 6, x: 200, y: 350, distance: -1, isVisited: false, isCurrently: false, isTarget: false, isInQueue: false, previous: null },
      { id: 7, x: 400, y: 350, distance: -1, isVisited: false, isCurrently: false, isTarget: false, isInQueue: false, previous: null },
    ];

    const newEdges: GraphEdge[] = [
      { from: 0, to: 1, weight: 4, isInPath: false, isRelaxed: false },
      { from: 0, to: 3, weight: 2, isInPath: false, isRelaxed: false },
      { from: 1, to: 2, weight: 3, isInPath: false, isRelaxed: false },
      { from: 1, to: 4, weight: 1, isInPath: false, isRelaxed: false },
      { from: 2, to: 5, weight: 2, isInPath: false, isRelaxed: false },
      { from: 3, to: 4, weight: 5, isInPath: false, isRelaxed: false },
      { from: 3, to: 6, weight: 3, isInPath: false, isRelaxed: false },
      { from: 4, to: 5, weight: 2, isInPath: false, isRelaxed: false },
      { from: 4, to: 6, weight: 1, isInPath: false, isRelaxed: false },
      { from: 4, to: 7, weight: 4, isInPath: false, isRelaxed: false },
      { from: 5, to: 7, weight: 1, isInPath: false, isRelaxed: false },
      { from: 6, to: 7, weight: 2, isInPath: false, isRelaxed: false },
      { from: 0, to: 2, weight: 7, isInPath: false, isRelaxed: false },
      { from: 1, to: 3, weight: 6, isInPath: false, isRelaxed: false },
    ];

    setNodes(newNodes);
    setEdges(newEdges);
    setVisitedOrder([]);
    setPriorityQueue([]);
    setSearchResult("");
    setCurrentStep("");
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeGraph();
  }, [initializeGraph]);

  // Get adjacent nodes with weights
  const getAdjacent = useCallback((nodeId: number): {id: number, weight: number}[] => {
    const adjacent: {id: number, weight: number}[] = [];
    edges.forEach((edge) => {
      if (edge.from === nodeId) adjacent.push({id: edge.to, weight: edge.weight});
      if (edge.to === nodeId) adjacent.push({id: edge.from, weight: edge.weight});
    });
    return adjacent;
  }, [edges]);

  // Reconstruct shortest path
  const reconstructPath = useCallback((target: number, nodeDistances: GraphNode[]): number[] => {
    const path: number[] = [];
    let current: number | null = target;
    
    while (current !== null) {
      path.unshift(current);
      current = nodeDistances.find(n => n.id === current)?.previous || null;
    }
    
    return path;
  }, []);

  // Dijkstra's algorithm
  const dijkstraSearch = useCallback(async (target: number, start: number = startNode) => {
    if (!nodes.length) return;

    setIsSearching(true);
    setSearchResult("");
    setVisitedOrder([]);
    setCurrentStep(`Starting Dijkstra's algorithm from node ${start}`);

    // Initialize distances and previous nodes
    const distances: GraphNode[] = nodes.map(node => ({
      ...node,
      distance: node.id === start ? 0 : -1,
      isVisited: false,
      isCurrently: false,
      isTarget: false,
      isInQueue: node.id === start,
      previous: null,
    }));

    setNodes(distances);
    setEdges(prev => prev.map(edge => ({ ...edge, isInPath: false, isRelaxed: false })));

    // Priority queue (min-heap simulation)
    const pq = [{id: start, distance: 0}];
    setPriorityQueue([...pq]);
    const visited = new Set<number>();
    const visitOrder: number[] = [];
    const actualDistances = new Map<number, number>();
    actualDistances.set(start, 0);

    await new Promise(resolve => setTimeout(resolve, Math.max(500, 1000 / speed)));

    while (pq.length > 0) {
      // Get node with minimum distance
      pq.sort((a, b) => a.distance - b.distance);
      const current = pq.shift()!;
      setPriorityQueue([...pq]);

      if (visited.has(current.id)) continue;

      // Mark as visited
      visited.add(current.id);
      visitOrder.push(current.id);
      setVisitedOrder([...visitOrder]);

      const currentDistance = actualDistances.get(current.id) || 0;
      setCurrentStep(`Visiting node ${current.id} (distance: ${currentDistance})`);
      
      // Update distances in the display
      distances.forEach(node => {
        if (node.id === current.id) {
          node.distance = currentDistance;
        }
        node.isVisited = visited.has(node.id);
        node.isCurrently = node.id === current.id;
        node.isInQueue = pq.some(p => p.id === node.id);
      });
      
      setNodes([...distances]);

      await new Promise(resolve => setTimeout(resolve, Math.max(600, 1200 / speed)));

      // Check if we found the target
      if (current.id === target) {
        const path = reconstructPath(target, distances);
        
        // Highlight shortest path edges
        setEdges(prev => prev.map(edge => ({
          ...edge,
          isInPath: path.some((nodeId, index) => 
            index < path.length - 1 && 
            ((edge.from === nodeId && edge.to === path[index + 1]) ||
             (edge.to === nodeId && edge.from === path[index + 1]))
          )
        })));

        setNodes(prev => prev.map(node => ({
          ...node,
          isTarget: node.id === target,
          isCurrently: false,
        })));

        const finalDistance = actualDistances.get(target);
        setSearchResult(`Shortest path to node ${target}: ${finalDistance}. Path: ${path.join(' → ')}`);
        setCurrentStep(`Target found! Shortest distance: ${finalDistance}`);
        setIsSearching(false);
        return;
      }

      // Relax adjacent edges
      const neighbors = getAdjacent(current.id);
      let relaxedAny = false;

      for (const neighbor of neighbors) {
        if (visited.has(neighbor.id)) continue;

        const newDistance = currentDistance + neighbor.weight;
        const currentNeighborDistance = actualDistances.get(neighbor.id);
        
        if (currentNeighborDistance === undefined || newDistance < currentNeighborDistance) {
          // Update distance and previous node
          actualDistances.set(neighbor.id, newDistance);
          distances.forEach(node => {
            if (node.id === neighbor.id) {
              node.distance = newDistance;
              node.previous = current.id;
            }
          });

          // Add/update in priority queue
          const existingIndex = pq.findIndex(p => p.id === neighbor.id);
          if (existingIndex >= 0) {
            pq[existingIndex].distance = newDistance;
          } else {
            pq.push({id: neighbor.id, distance: newDistance});
          }

          // Mark edge as relaxed
          setEdges(prev => prev.map(edge => ({
            ...edge,
            isRelaxed: edge.isRelaxed || 
              ((edge.from === current.id && edge.to === neighbor.id) ||
               (edge.to === current.id && edge.from === neighbor.id))
          })));

          relaxedAny = true;
        }
      }

      setPriorityQueue([...pq]);
      setNodes([...distances]);

      if (relaxedAny) {
        setCurrentStep(`Relaxed edges from node ${current.id}`);
      } else {
        setCurrentStep(`No edges to relax from node ${current.id}`);
      }

      await new Promise(resolve => setTimeout(resolve, Math.max(400, 800 / speed)));
    }

    // Target not reachable
    setNodes(prev => prev.map(node => ({
      ...node,
      isCurrently: false,
      isInQueue: false,
    })));
    setSearchResult(`Node ${target} is not reachable from node ${start}`);
    setCurrentStep(`Search completed - target not reachable`);
    setIsSearching(false);
  }, [nodes, startNode, speed, getAdjacent, reconstructPath]);

  const handleSearch = () => {
    const target = parseInt(searchValue);
    if (!isNaN(target) && target >= 0 && target < nodes.length) {
      dijkstraSearch(target);
    }
  };

  const generateRandomGraph = () => {
    if (isSearching) return;

    // Generate random positions
    const newNodes: GraphNode[] = [];
    for (let i = 0; i < 8; i++) {
      newNodes.push({
        id: i,
        x: 80 + Math.random() * 440,
        y: 80 + Math.random() * 240,
        distance: -1,
        isVisited: false,
        isCurrently: false,
        isTarget: false,
        isInQueue: false,
        previous: null,
      });
    }

    // Generate random weighted edges
    const newEdges: GraphEdge[] = [];
    const connected = new Set([0]);

    // Ensure connectivity by connecting each node to at least one connected node
    for (let i = 1; i < newNodes.length; i++) {
      const connectTo = Array.from(connected)[Math.floor(Math.random() * connected.size)];
      const weight = Math.floor(Math.random() * 9) + 1;
      newEdges.push({ from: connectTo, to: i, weight, isInPath: false, isRelaxed: false });
      connected.add(i);
    }

    // Add additional random edges
    for (let i = 0; i < 8; i++) {
      const from = Math.floor(Math.random() * newNodes.length);
      const to = Math.floor(Math.random() * newNodes.length);
      if (
        from !== to &&
        !newEdges.some(e => (e.from === from && e.to === to) || (e.from === to && e.to === from))
      ) {
        const weight = Math.floor(Math.random() * 9) + 1;
        newEdges.push({ from, to, weight, isInPath: false, isRelaxed: false });
      }
    }

    setNodes(newNodes);
    setEdges(newEdges);
    setVisitedOrder([]);
    setPriorityQueue([]);
    setSearchResult("");
    setCurrentStep("");
  };

  return (
    <div className="h-full flex flex-col p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Dijkstra&apos;s Algorithm</h2>
        <p className="text-muted-foreground">
          Finds the shortest path from a source node to all other nodes in a weighted graph with non-negative edge weights.
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
            Find Path
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
                // Start the search automatically after a short delay
                setTimeout(() => {
                  dijkstraSearch(randomNode.id);
                }, 100);
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
        <div className="w-full max-w-3xl bg-muted/20 rounded-lg p-4 mb-4">
          <svg className="w-full h-96" viewBox="0 0 600 400">
            {/* Edges */}
            {edges.map((edge, index) => {
              const fromNode = nodes.find((n) => n.id === edge.from);
              const toNode = nodes.find((n) => n.id === edge.to);
              if (!fromNode || !toNode) return null;

              const midX = (fromNode.x + toNode.x) / 2;
              const midY = (fromNode.y + toNode.y) / 2;

              return (
                <g key={index}>
                  <motion.line
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke={
                      edge.isInPath 
                        ? "#10b981" 
                        : edge.isRelaxed 
                        ? "#f59e0b" 
                        : "#94a3b8"
                    }
                    strokeWidth={edge.isInPath ? "4" : edge.isRelaxed ? "3" : "2"}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                  {/* Edge weight */}
                  <rect
                    x={midX - 12}
                    y={midY - 10}
                    width="24"
                    height="20"
                    fill="white"
                    stroke="#94a3b8"
                    strokeWidth="1"
                    rx="3"
                  />
                  <text
                    x={midX}
                    y={midY + 4}
                    textAnchor="middle"
                    className="text-xs font-bold select-none"
                    fill="black"
                  >
                    {edge.weight}
                  </text>
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map((node) => (
              <motion.g key={node.id}>
                {/* Node circle */}
                <motion.circle
                  cx={node.x}
                  cy={node.y}
                  r="25"
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
                    scale: node.isCurrently ? 1.2 : 1,
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
                    y={node.y - 35}
                    textAnchor="middle"
                    className="text-xs font-medium select-none"
                    fill="#3b82f6"
                  >
                    {node.distance}
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
            <div className={`text-lg font-medium ${searchResult.includes("Shortest") ? "text-green-600" : "text-red-600"}`}>
              {searchResult}
            </div>
          )}
        </div>

        {/* Info Panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-5xl">
          {/* Priority Queue */}
          <div className="bg-muted/50 rounded-lg p-3">
            <h3 className="font-medium mb-2 text-sm">Priority Queue:</h3>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {priorityQueue.length === 0 ? (
                <div className="text-xs text-muted-foreground">Empty</div>
              ) : (
                priorityQueue
                  .sort((a, b) => a.distance - b.distance)
                  .map((item, index) => (
                    <div
                      key={index}
                      className={`text-xs p-1 rounded ${
                        index === 0 ? "bg-purple-100 text-purple-800 font-medium" : "bg-gray-100"
                      }`}
                    >
                      Node {item.id}: {item.distance}
                      {index === 0 && " ← Next"}
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

          {/* Algorithm Properties */}
          <div className="bg-muted/50 rounded-lg p-3">
            <h3 className="font-medium mb-2 text-sm">Dijkstra Properties:</h3>
            <div className="text-xs space-y-1">
              <div>• Finds shortest paths</div>
              <div>• Uses priority queue</div>
              <div>• Greedy algorithm</div>
              <div>• Time: O((V + E) log V)</div>
              <div>• Non-negative weights only</div>
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
            <span>In priority queue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
            <span>Currently processing</span>
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
            <div className="w-3 h-1 bg-green-500"></div>
            <span>Shortest path</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 bg-yellow-500"></div>
            <span>Edge relaxed</span>
          </div>
        </div>
      </div>
    </div>
  );
}