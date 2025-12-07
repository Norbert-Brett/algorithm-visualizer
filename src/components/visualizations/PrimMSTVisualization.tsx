"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, RotateCcw, Shuffle } from "lucide-react";

interface PrimMSTVisualizationProps {
  speed: number;
}

interface GraphNode {
  id: number;
  x: number;
  y: number;
  isInMST: boolean;
  isCurrently: boolean;
  key: number; // Minimum edge weight to MST
}

interface GraphEdge {
  from: number;
  to: number;
  weight: number;
  isInMST: boolean;
  isConsidering: boolean;
}

export default function PrimMSTVisualization({ speed }: PrimMSTVisualizationProps) {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [startNode, setStartNode] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [totalWeight, setTotalWeight] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [mstEdges, setMstEdges] = useState<{from: number, to: number, weight: number}[]>([]);

  // Initialize graph
  const initializeGraph = useCallback(() => {
    const newNodes: GraphNode[] = [
      { id: 0, x: 200, y: 100, isInMST: false, isCurrently: false, key: Infinity },
      { id: 1, x: 400, y: 100, isInMST: false, isCurrently: false, key: Infinity },
      { id: 2, x: 500, y: 250, isInMST: false, isCurrently: false, key: Infinity },
      { id: 3, x: 400, y: 400, isInMST: false, isCurrently: false, key: Infinity },
      { id: 4, x: 200, y: 400, isInMST: false, isCurrently: false, key: Infinity },
      { id: 5, x: 100, y: 250, isInMST: false, isCurrently: false, key: Infinity },
      { id: 6, x: 300, y: 250, isInMST: false, isCurrently: false, key: Infinity },
    ];

    const newEdges: GraphEdge[] = [
      { from: 0, to: 1, weight: 7, isInMST: false, isConsidering: false },
      { from: 0, to: 5, weight: 5, isInMST: false, isConsidering: false },
      { from: 0, to: 6, weight: 3, isInMST: false, isConsidering: false },
      { from: 1, to: 2, weight: 8, isInMST: false, isConsidering: false },
      { from: 1, to: 6, weight: 4, isInMST: false, isConsidering: false },
      { from: 2, to: 3, weight: 5, isInMST: false, isConsidering: false },
      { from: 2, to: 6, weight: 6, isInMST: false, isConsidering: false },
      { from: 3, to: 4, weight: 9, isInMST: false, isConsidering: false },
      { from: 3, to: 6, weight: 7, isInMST: false, isConsidering: false },
      { from: 4, to: 5, weight: 6, isInMST: false, isConsidering: false },
      { from: 4, to: 6, weight: 8, isInMST: false, isConsidering: false },
      { from: 5, to: 6, weight: 2, isInMST: false, isConsidering: false },
    ];

    setNodes(newNodes);
    setEdges(newEdges);
    setTotalWeight(0);
    setCurrentStep("");
    setMstEdges([]);
  }, []);

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

  // Prim's algorithm
  const runPrimMST = useCallback(async (start: number = startNode) => {
    if (!nodes.length || isRunning) return;

    setIsRunning(true);
    setCurrentStep(`Starting Prim's algorithm from node ${start}`);
    setTotalWeight(0);
    setMstEdges([]);

    // Reset all nodes and edges
    const nodesCopy = nodes.map(node => ({
      ...node,
      isInMST: false,
      isCurrently: false,
      key: node.id === start ? 0 : Infinity,
    }));
    setNodes(nodesCopy);
    setEdges(prev => prev.map(edge => ({ ...edge, isInMST: false, isConsidering: false })));

    await new Promise(resolve => setTimeout(resolve, Math.max(500, 1000 / speed)));

    const inMST = new Set<number>();
    const keys = new Map<number, number>();
    const parent = new Map<number, number | null>();
    let weight = 0;
    const mstEdgesList: {from: number, to: number, weight: number}[] = [];

    // Initialize keys
    nodesCopy.forEach(node => {
      keys.set(node.id, node.id === start ? 0 : Infinity);
      parent.set(node.id, null);
    });

    while (inMST.size < nodesCopy.length) {
      // Find node with minimum key not in MST
      let minKey = Infinity;
      let minNode = -1;

      for (const node of nodesCopy) {
        if (!inMST.has(node.id) && keys.get(node.id)! < minKey) {
          minKey = keys.get(node.id)!;
          minNode = node.id;
        }
      }

      if (minNode === -1) break; // Graph is disconnected

      // Add node to MST
      inMST.add(minNode);
      
      // Update display
      nodesCopy.forEach(node => {
        node.isInMST = inMST.has(node.id);
        node.isCurrently = node.id === minNode;
        node.key = keys.get(node.id)!;
      });
      setNodes([...nodesCopy]);

      // Add edge to MST if not the start node
      if (parent.get(minNode) !== null) {
        const parentNode = parent.get(minNode)!;
        const edgeWeight = keys.get(minNode)!;
        weight += edgeWeight;
        mstEdgesList.push({from: parentNode, to: minNode, weight: edgeWeight});
        setMstEdges([...mstEdgesList]);
        setTotalWeight(weight);

        // Mark edge as in MST
        setEdges(prev => prev.map(edge => ({
          ...edge,
          isInMST: edge.isInMST || 
            ((edge.from === parentNode && edge.to === minNode) ||
             (edge.to === parentNode && edge.from === minNode)),
          isConsidering: false,
        })));

        setCurrentStep(`Added edge ${parentNode}-${minNode} (weight: ${edgeWeight}) to MST`);
      } else {
        setCurrentStep(`Starting from node ${minNode}`);
      }

      await new Promise(resolve => setTimeout(resolve, Math.max(800, 1600 / speed)));

      // Update keys for adjacent nodes
      const neighbors = getAdjacent(minNode);
      let updatedAny = false;

      for (const neighbor of neighbors) {
        if (!inMST.has(neighbor.id) && neighbor.weight < keys.get(neighbor.id)!) {
          keys.set(neighbor.id, neighbor.weight);
          parent.set(neighbor.id, minNode);
          updatedAny = true;

          // Highlight edge being considered
          setEdges(prev => prev.map(edge => ({
            ...edge,
            isConsidering: !edge.isInMST && 
              ((edge.from === minNode && edge.to === neighbor.id) ||
               (edge.to === minNode && edge.from === neighbor.id)),
          })));

          await new Promise(resolve => setTimeout(resolve, Math.max(300, 600 / speed)));
        }
      }

      // Update node keys in display
      nodesCopy.forEach(node => {
        node.key = keys.get(node.id)!;
        node.isCurrently = false;
      });
      setNodes([...nodesCopy]);

      if (updatedAny) {
        setCurrentStep(`Updated keys for neighbors of node ${minNode}`);
      }

      // Clear considering edges
      setEdges(prev => prev.map(edge => ({ ...edge, isConsidering: false })));

      await new Promise(resolve => setTimeout(resolve, Math.max(400, 800 / speed)));
    }

    setCurrentStep(`MST complete! Total weight: ${weight}`);
    setIsRunning(false);
  }, [nodes, startNode, isRunning, speed, getAdjacent]);

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
        isInMST: false,
        isCurrently: false,
        key: Infinity,
      });
    }

    // Generate random weighted edges (ensure connectivity)
    const newEdges: GraphEdge[] = [];
    
    // Create a spanning tree first to ensure connectivity
    for (let i = 1; i < numNodes; i++) {
      const connectTo = Math.floor(Math.random() * i);
      const weight = Math.floor(Math.random() * 9) + 1;
      newEdges.push({ from: connectTo, to: i, weight, isInMST: false, isConsidering: false });
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
        newEdges.push({ from, to, weight, isInMST: false, isConsidering: false });
      }
    }

    setNodes(newNodes);
    setEdges(newEdges);
    setTotalWeight(0);
    setCurrentStep("");
    setMstEdges([]);
  };

  return (
    <div className="h-full flex flex-col p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Prim&apos;s Minimum Spanning Tree</h2>
        <p className="text-muted-foreground">
          Greedy algorithm that builds a minimum spanning tree by adding the minimum weight edge connecting the tree to a new vertex.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex gap-2">
          <Input
            type="number"
            value={startNode}
            onChange={(e) => setStartNode(parseInt(e.target.value) || 0)}
            placeholder="Start node"
            className="w-32"
            min="0"
            max={nodes.length - 1}
          />
          <Button onClick={() => runPrimMST()} disabled={isRunning || !nodes.length}>
            <Play className="h-4 w-4 mr-2" />
            Run Prim&apos;s
          </Button>
        </div>
        <div className="flex gap-2">
          <Button onClick={generateRandomGraph} disabled={isRunning} variant="outline">
            <Shuffle className="h-4 w-4 mr-2" />
            Random Graph
          </Button>
          <Button onClick={initializeGraph} disabled={isRunning} variant="outline">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      {/* Graph Visualization */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-3xl bg-muted/20 rounded-lg p-4 mb-4">
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
                        : "#94a3b8"
                    }
                    strokeWidth={edge.isInMST ? "4" : edge.isConsidering ? "3" : "2"}
                    opacity={edge.isInMST || edge.isConsidering ? 1 : 0.4}
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
                    stroke={edge.isInMST ? "#10b981" : "#94a3b8"}
                    strokeWidth="1"
                    rx="3"
                  />
                  <text
                    x={midX}
                    y={midY + 4}
                    textAnchor="middle"
                    className="text-xs font-bold select-none"
                    fill={edge.isInMST ? "#10b981" : "black"}
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
                    node.isInMST
                      ? "#10b981"
                      : node.isCurrently
                      ? "#f59e0b"
                      : "#e2e8f0"
                  }
                  stroke={
                    node.isCurrently
                      ? "#f59e0b"
                      : node.isInMST
                      ? "#10b981"
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
                  fill={node.isInMST || node.isCurrently ? "white" : "black"}
                >
                  {node.id}
                </text>

                {/* Key value */}
                {node.key !== Infinity && node.key > 0 && !node.isInMST && (
                  <text
                    x={node.x}
                    y={node.y - 35}
                    textAnchor="middle"
                    className="text-xs font-medium select-none"
                    fill="#3b82f6"
                  >
                    key: {node.key}
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
          {totalWeight > 0 && (
            <div className="text-lg font-medium text-green-600">
              Total MST Weight: {totalWeight}
            </div>
          )}
        </div>

        {/* Info Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
          {/* MST Edges */}
          <div className="bg-muted/50 rounded-lg p-3">
            <h3 className="font-medium mb-2 text-sm">MST Edges:</h3>
            <div className="space-y-1 max-h-32 overflow-y-auto">
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
            <h3 className="font-medium mb-2 text-sm">Prim&apos;s Properties:</h3>
            <div className="text-xs space-y-1">
              <div>• Greedy algorithm</div>
              <div>• Builds MST incrementally</div>
              <div>• Time: O(E log V)</div>
              <div>• Works on connected graphs</div>
              <div>• Finds minimum total weight</div>
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
            <span>Not in MST</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
            <span>Currently processing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span>In MST</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 bg-green-500"></div>
            <span>MST edge</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 bg-yellow-500"></div>
            <span>Considering edge</span>
          </div>
        </div>
      </div>
    </div>
  );
}
