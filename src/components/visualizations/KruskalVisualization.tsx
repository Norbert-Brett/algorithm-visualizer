"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, Shuffle } from "lucide-react";

interface KruskalVisualizationProps {
  speed: number;
}

interface GraphNode {
  id: number;
  x: number;
  y: number;
  parent: number;
  rank: number;
}

interface GraphEdge {
  from: number;
  to: number;
  weight: number;
  isInMST: boolean;
  isConsidering: boolean;
  isRejected: boolean;
}

export default function KruskalVisualization({ speed }: KruskalVisualizationProps) {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [totalWeight, setTotalWeight] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [sortedEdges, setSortedEdges] = useState<GraphEdge[]>([]);
  const [mstEdges, setMstEdges] = useState<{from: number, to: number, weight: number}[]>([]);

  // Initialize graph
  const initializeGraph = useCallback(() => {
    const newNodes: GraphNode[] = [
      { id: 0, x: 200, y: 100, parent: 0, rank: 0 },
      { id: 1, x: 400, y: 100, parent: 1, rank: 0 },
      { id: 2, x: 500, y: 250, parent: 2, rank: 0 },
      { id: 3, x: 400, y: 400, parent: 3, rank: 0 },
      { id: 4, x: 200, y: 400, parent: 4, rank: 0 },
      { id: 5, x: 100, y: 250, parent: 5, rank: 0 },
      { id: 6, x: 300, y: 250, parent: 6, rank: 0 },
    ];

    const newEdges: GraphEdge[] = [
      { from: 0, to: 1, weight: 7, isInMST: false, isConsidering: false, isRejected: false },
      { from: 0, to: 5, weight: 5, isInMST: false, isConsidering: false, isRejected: false },
      { from: 0, to: 6, weight: 3, isInMST: false, isConsidering: false, isRejected: false },
      { from: 1, to: 2, weight: 8, isInMST: false, isConsidering: false, isRejected: false },
      { from: 1, to: 6, weight: 4, isInMST: false, isConsidering: false, isRejected: false },
      { from: 2, to: 3, weight: 5, isInMST: false, isConsidering: false, isRejected: false },
      { from: 2, to: 6, weight: 6, isInMST: false, isConsidering: false, isRejected: false },
      { from: 3, to: 4, weight: 9, isInMST: false, isConsidering: false, isRejected: false },
      { from: 3, to: 6, weight: 7, isInMST: false, isConsidering: false, isRejected: false },
      { from: 4, to: 5, weight: 6, isInMST: false, isConsidering: false, isRejected: false },
      { from: 4, to: 6, weight: 8, isInMST: false, isConsidering: false, isRejected: false },
      { from: 5, to: 6, weight: 2, isInMST: false, isConsidering: false, isRejected: false },
    ];

    setNodes(newNodes);
    setEdges(newEdges);
    setSortedEdges([...newEdges].sort((a, b) => a.weight - b.weight));
    setTotalWeight(0);
    setCurrentStep("");
    setMstEdges([]);
  }, []);

  useEffect(() => {
    initializeGraph();
  }, [initializeGraph]);

  // Union-Find operations
  const find = useCallback((nodesCopy: GraphNode[], x: number): number => {
    if (nodesCopy[x].parent !== x) {
      nodesCopy[x].parent = find(nodesCopy, nodesCopy[x].parent);
    }
    return nodesCopy[x].parent;
  }, []);

  const union = useCallback((nodesCopy: GraphNode[], x: number, y: number): boolean => {
    const rootX = find(nodesCopy, x);
    const rootY = find(nodesCopy, y);

    if (rootX === rootY) return false;

    // Union by rank
    if (nodesCopy[rootX].rank < nodesCopy[rootY].rank) {
      nodesCopy[rootX].parent = rootY;
    } else if (nodesCopy[rootX].rank > nodesCopy[rootY].rank) {
      nodesCopy[rootY].parent = rootX;
    } else {
      nodesCopy[rootY].parent = rootX;
      nodesCopy[rootX].rank++;
    }

    return true;
  }, [find]);

  // Kruskal's algorithm
  const runKruskalMST = useCallback(async () => {
    if (!nodes.length || isRunning) return;

    setIsRunning(true);
    setCurrentStep("Starting Kruskal's algorithm");
    setTotalWeight(0);
    setMstEdges([]);

    // Reset nodes (each node is its own set)
    const nodesCopy = nodes.map(node => ({
      ...node,
      parent: node.id,
      rank: 0,
    }));
    setNodes(nodesCopy);

    // Reset and sort edges
    const edgesCopy = edges.map(edge => ({
      ...edge,
      isInMST: false,
      isConsidering: false,
      isRejected: false,
    }));
    edgesCopy.sort((a, b) => a.weight - b.weight);
    setEdges(edgesCopy);
    setSortedEdges([...edgesCopy]);

    await new Promise(resolve => setTimeout(resolve, Math.max(500, 1000 / speed)));

    let weight = 0;
    const mstEdgesList: {from: number, to: number, weight: number}[] = [];
    let edgesAdded = 0;

    for (let i = 0; i < edgesCopy.length && edgesAdded < nodesCopy.length - 1; i++) {
      const edge = edgesCopy[i];

      // Highlight edge being considered
      setEdges(prev => prev.map(e => ({
        ...e,
        isConsidering: e.from === edge.from && e.to === edge.to,
      })));

      setCurrentStep(`Considering edge ${edge.from}-${edge.to} (weight: ${edge.weight})`);
      await new Promise(resolve => setTimeout(resolve, Math.max(600, 1200 / speed)));

      // Check if adding this edge creates a cycle
      const rootFrom = find(nodesCopy, edge.from);
      const rootTo = find(nodesCopy, edge.to);

      if (rootFrom !== rootTo) {
        // No cycle, add to MST
        union(nodesCopy, edge.from, edge.to);
        edgesAdded++;
        weight += edge.weight;
        mstEdgesList.push({from: edge.from, to: edge.to, weight: edge.weight});

        setEdges(prev => prev.map(e => ({
          ...e,
          isInMST: e.isInMST || (e.from === edge.from && e.to === edge.to),
          isConsidering: false,
        })));

        setMstEdges([...mstEdgesList]);
        setTotalWeight(weight);
        setNodes([...nodesCopy]);

        setCurrentStep(`Added edge ${edge.from}-${edge.to} to MST (total weight: ${weight})`);
        await new Promise(resolve => setTimeout(resolve, Math.max(800, 1600 / speed)));
      } else {
        // Cycle detected, reject edge
        setEdges(prev => prev.map(e => ({
          ...e,
          isRejected: e.isRejected || (e.from === edge.from && e.to === edge.to),
          isConsidering: false,
        })));

        setCurrentStep(`Rejected edge ${edge.from}-${edge.to} (would create cycle)`);
        await new Promise(resolve => setTimeout(resolve, Math.max(600, 1200 / speed)));
      }
    }

    setCurrentStep(`MST complete! Total weight: ${weight}`);
    setIsRunning(false);
  }, [nodes, edges, isRunning, speed, find, union]);

  const generateRandomGraph = () => {
    if (isRunning) return;

    // Generate random positions in a circle
    const newNodes: GraphNode[] = [];
    const numNodes = 6 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < numNodes; i++) {
      const angle = (i / numNodes) * 2 * Math.PI;
      const radius = 150 + Math.random() * 50;
      newNodes.push({
        id: i,
        x: 300 + Math.cos(angle) * radius,
        y: 250 + Math.sin(angle) * radius,
        parent: i,
        rank: 0,
      });
    }

    // Generate random weighted edges
    const newEdges: GraphEdge[] = [];
    
    // Create a spanning tree first to ensure connectivity
    for (let i = 1; i < numNodes; i++) {
      const connectTo = Math.floor(Math.random() * i);
      const weight = Math.floor(Math.random() * 9) + 1;
      newEdges.push({ 
        from: connectTo, 
        to: i, 
        weight, 
        isInMST: false, 
        isConsidering: false,
        isRejected: false 
      });
    }

    // Add additional random edges
    for (let i = 0; i < numNodes * 2; i++) {
      const from = Math.floor(Math.random() * numNodes);
      const to = Math.floor(Math.random() * numNodes);
      if (
        from !== to &&
        !newEdges.some(e => (e.from === from && e.to === to) || (e.from === to && e.to === from))
      ) {
        const weight = Math.floor(Math.random() * 9) + 1;
        newEdges.push({ 
          from, 
          to, 
          weight, 
          isInMST: false, 
          isConsidering: false,
          isRejected: false 
        });
      }
    }

    setNodes(newNodes);
    setEdges(newEdges);
    setSortedEdges([...newEdges].sort((a, b) => a.weight - b.weight));
    setTotalWeight(0);
    setCurrentStep("");
    setMstEdges([]);
  };

  return (
    <div className="h-full flex flex-col p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Kruskal&apos;s Algorithm</h2>
        <p className="text-muted-foreground">
          Greedy algorithm that builds a minimum spanning tree by sorting edges and adding them if they don&apos;t create a cycle.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Button onClick={runKruskalMST} disabled={isRunning || !nodes.length}>
          <Play className="h-4 w-4 mr-2" />
          Run Kruskal&apos;s
        </Button>
        <Button onClick={generateRandomGraph} disabled={isRunning} variant="outline">
          <Shuffle className="h-4 w-4 mr-2" />
          Random Graph
        </Button>
        <Button onClick={initializeGraph} disabled={isRunning} variant="outline">
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>

      {/* Graph Visualization */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4">
        {/* Graph Display */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-full max-w-2xl bg-muted/20 rounded-lg p-4 mb-4">
            <svg className="w-full h-96" viewBox="0 0 600 500">
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
                        edge.isInMST
                          ? "#10b981"
                          : edge.isConsidering
                          ? "#f59e0b"
                          : edge.isRejected
                          ? "#ef4444"
                          : "#94a3b8"
                      }
                      strokeWidth={edge.isInMST ? "4" : edge.isConsidering ? "3" : "2"}
                      opacity={edge.isInMST || edge.isConsidering ? 1 : edge.isRejected ? 0.3 : 0.4}
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
                      stroke={edge.isInMST ? "#10b981" : edge.isRejected ? "#ef4444" : "#94a3b8"}
                      strokeWidth="1"
                      rx="3"
                    />
                    <text
                      x={midX}
                      y={midY + 4}
                      textAnchor="middle"
                      className="text-xs font-bold select-none"
                      fill={edge.isInMST ? "#10b981" : edge.isRejected ? "#ef4444" : "black"}
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
                    fill="#e2e8f0"
                    stroke="#64748b"
                    strokeWidth="2"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  />

                  {/* Node label */}
                  <text
                    x={node.x}
                    y={node.y + 5}
                    textAnchor="middle"
                    className="text-sm font-bold select-none"
                    fill="black"
                  >
                    {node.id}
                  </text>
                </motion.g>
              ))}
            </svg>
          </div>

          {/* Status */}
          <div className="text-center space-y-2">
            {currentStep && (
              <div className="text-lg font-medium text-blue-600">
                {currentStep}
              </div>
            )}
            {totalWeight > 0 && (
              <div className="text-lg font-medium text-green-600">
                Total MST Weight: {totalWeight}
              </div>
            )}
          </div>
        </div>

        {/* Edge List and Info */}
        <div className="w-full lg:w-80 space-y-4">
          {/* Sorted Edge List */}
          <div className="bg-muted/50 rounded-lg p-3">
            <h3 className="font-medium mb-2 text-sm">Sorted Edges:</h3>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {sortedEdges.map((edge, index) => {
                const isInMST = edges.find(e => e.from === edge.from && e.to === edge.to)?.isInMST;
                const isRejected = edges.find(e => e.from === edge.from && e.to === edge.to)?.isRejected;
                const isConsidering = edges.find(e => e.from === edge.from && e.to === edge.to)?.isConsidering;

                return (
                  <div
                    key={index}
                    className={`text-xs p-1 rounded ${
                      isInMST
                        ? "bg-green-100 text-green-800 font-medium"
                        : isConsidering
                        ? "bg-yellow-100 text-yellow-800 font-medium"
                        : isRejected
                        ? "bg-red-100 text-red-800 line-through"
                        : "bg-gray-100"
                    }`}
                  >
                    {edge.from} ↔ {edge.to}: {edge.weight}
                    {isInMST && " ✓"}
                    {isRejected && " ✗"}
                  </div>
                );
              })}
            </div>
          </div>

          {/* MST Edges */}
          <div className="bg-muted/50 rounded-lg p-3">
            <h3 className="font-medium mb-2 text-sm">MST Edges:</h3>
            <div className="space-y-1">
              {mstEdges.length === 0 ? (
                <div className="text-xs text-muted-foreground">No edges yet</div>
              ) : (
                mstEdges.map((edge, index) => (
                  <div key={index} className="text-xs bg-green-100 text-green-800 p-1 rounded">
                    {edge.from} ↔ {edge.to} (weight: {edge.weight})
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Algorithm Properties */}
          <div className="bg-muted/50 rounded-lg p-3">
            <h3 className="font-medium mb-2 text-sm">Kruskal&apos;s Properties:</h3>
            <div className="text-xs space-y-1">
              <div>• Greedy algorithm</div>
              <div>• Sorts edges by weight</div>
              <div>• Uses union-find</div>
              <div>• Time: O(E log E)</div>
              <div>• Avoids cycles</div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <div className="text-sm font-medium mb-2">Legend:</div>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 bg-gray-400"></div>
            <span>Not processed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 bg-yellow-500"></div>
            <span>Considering</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 bg-green-500"></div>
            <span>In MST</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 bg-red-500"></div>
            <span>Rejected (cycle)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
