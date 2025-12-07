"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, Shuffle } from "lucide-react";

interface TopologicalSortIndegreeVisualizationProps {
  speed: number;
}

interface GraphNode {
  id: number;
  label: string;
  x: number;
  y: number;
  indegree: number;
  isProcessed: boolean;
  isInQueue: boolean;
  isCurrently: boolean;
}

interface GraphEdge {
  from: number;
  to: number;
  isProcessed: boolean;
}

export default function TopologicalSortIndegreeVisualization({ speed }: TopologicalSortIndegreeVisualizationProps) {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState("");
  const [queue, setQueue] = useState<number[]>([]);
  const [topologicalOrder, setTopologicalOrder] = useState<string[]>([]);

  // Initialize DAG
  const initializeGraph = useCallback(() => {
    const newNodes: GraphNode[] = [
      { id: 0, label: "A", x: 100, y: 100, indegree: 0, isProcessed: false, isInQueue: false, isCurrently: false },
      { id: 1, label: "B", x: 300, y: 100, indegree: 0, isProcessed: false, isInQueue: false, isCurrently: false },
      { id: 2, label: "C", x: 500, y: 100, indegree: 0, isProcessed: false, isInQueue: false, isCurrently: false },
      { id: 3, label: "D", x: 200, y: 250, indegree: 0, isProcessed: false, isInQueue: false, isCurrently: false },
      { id: 4, label: "E", x: 400, y: 250, indegree: 0, isProcessed: false, isInQueue: false, isCurrently: false },
      { id: 5, label: "F", x: 300, y: 400, indegree: 0, isProcessed: false, isInQueue: false, isCurrently: false },
    ];

    const newEdges: GraphEdge[] = [
      { from: 0, to: 3, isProcessed: false },
      { from: 0, to: 4, isProcessed: false },
      { from: 1, to: 3, isProcessed: false },
      { from: 1, to: 4, isProcessed: false },
      { from: 2, to: 4, isProcessed: false },
      { from: 3, to: 5, isProcessed: false },
      { from: 4, to: 5, isProcessed: false },
    ];

    // Calculate initial indegrees
    newEdges.forEach(edge => {
      newNodes[edge.to].indegree++;
    });

    setNodes(newNodes);
    setEdges(newEdges);
    setQueue([]);
    setTopologicalOrder([]);
    setCurrentStep("");
  }, []);

  useEffect(() => {
    initializeGraph();
  }, [initializeGraph]);

  // Topological sort using Kahn's algorithm (indegree-based)
  const runTopologicalSort = useCallback(async () => {
    if (!nodes.length || isRunning) return;

    setIsRunning(true);
    setCurrentStep("Starting topological sort (Kahn's algorithm)");
    setTopologicalOrder([]);

    // Reset nodes
    const nodesCopy = nodes.map(node => ({
      ...node,
      isProcessed: false,
      isInQueue: false,
      isCurrently: false,
    }));

    // Recalculate indegrees
    nodesCopy.forEach(node => {
      node.indegree = 0;
    });
    edges.forEach(edge => {
      nodesCopy[edge.to].indegree++;
    });

    setNodes(nodesCopy);
    setEdges(prev => prev.map(edge => ({ ...edge, isProcessed: false })));

    await new Promise(resolve => setTimeout(resolve, Math.max(500, 1000 / speed)));

    // Find all nodes with indegree 0
    const queue: number[] = [];
    nodesCopy.forEach(node => {
      if (node.indegree === 0) {
        queue.push(node.id);
        node.isInQueue = true;
      }
    });

    setQueue([...queue]);
    setNodes([...nodesCopy]);
    setCurrentStep(`Found ${queue.length} node(s) with indegree 0`);

    await new Promise(resolve => setTimeout(resolve, Math.max(800, 1600 / speed)));

    const order: string[] = [];

    while (queue.length > 0) {
      const current = queue.shift()!;
      setQueue([...queue]);

      // Mark as currently processing
      nodesCopy.forEach(node => {
        node.isCurrently = node.id === current;
        node.isInQueue = queue.includes(node.id);
      });
      setNodes([...nodesCopy]);

      setCurrentStep(`Processing node ${nodesCopy[current].label}`);
      await new Promise(resolve => setTimeout(resolve, Math.max(600, 1200 / speed)));

      // Add to topological order
      order.push(nodesCopy[current].label);
      setTopologicalOrder([...order]);

      // Mark as processed
      nodesCopy[current].isProcessed = true;
      nodesCopy[current].isCurrently = false;
      setNodes([...nodesCopy]);

      // Find outgoing edges and reduce indegrees
      const outgoingEdges = edges.filter(edge => edge.from === current);
      
      for (const edge of outgoingEdges) {
        // Mark edge as processed
        setEdges(prev => prev.map(e => ({
          ...e,
          isProcessed: e.isProcessed || (e.from === edge.from && e.to === edge.to),
        })));

        // Reduce indegree
        nodesCopy[edge.to].indegree--;

        setCurrentStep(`Reduced indegree of ${nodesCopy[edge.to].label} to ${nodesCopy[edge.to].indegree}`);
        setNodes([...nodesCopy]);

        await new Promise(resolve => setTimeout(resolve, Math.max(400, 800 / speed)));

        // If indegree becomes 0, add to queue
        if (nodesCopy[edge.to].indegree === 0 && !nodesCopy[edge.to].isProcessed) {
          queue.push(edge.to);
          nodesCopy[edge.to].isInQueue = true;
          setQueue([...queue]);
          setNodes([...nodesCopy]);

          setCurrentStep(`Added ${nodesCopy[edge.to].label} to queue (indegree = 0)`);
          await new Promise(resolve => setTimeout(resolve, Math.max(400, 800 / speed)));
        }
      }
    }

    // Check if all nodes were processed (cycle detection)
    if (order.length === nodesCopy.length) {
      setCurrentStep(`Topological sort complete! Order: ${order.join(" → ")}`);
    } else {
      setCurrentStep(`Error: Graph contains a cycle! Only processed ${order.length}/${nodesCopy.length} nodes`);
    }

    setIsRunning(false);
  }, [nodes, edges, isRunning, speed]);

  const generateRandomDAG = () => {
    if (isRunning) return;

    const numNodes = 5 + Math.floor(Math.random() * 3);
    const labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const newNodes: GraphNode[] = [];

    // Create nodes in layers
    const layers = 3;
    const nodesPerLayer = Math.ceil(numNodes / layers);

    for (let i = 0; i < numNodes; i++) {
      const layer = Math.floor(i / nodesPerLayer);
      const posInLayer = i % nodesPerLayer;
      const layerSize = Math.min(nodesPerLayer, numNodes - layer * nodesPerLayer);

      newNodes.push({
        id: i,
        label: labels[i],
        x: 100 + (posInLayer * 400) / Math.max(1, layerSize - 1),
        y: 100 + layer * 150,
        indegree: 0,
        isProcessed: false,
        isInQueue: false,
        isCurrently: false,
      });
    }

    // Create edges (only from earlier layers to later layers to ensure DAG)
    const newEdges: GraphEdge[] = [];
    for (let i = 0; i < numNodes; i++) {
      const currentLayer = Math.floor(i / nodesPerLayer);
      const numEdges = Math.floor(Math.random() * 2) + 1;

      for (let j = 0; j < numEdges; j++) {
        // Connect to nodes in next layers
        const targetLayer = currentLayer + 1 + Math.floor(Math.random() * (layers - currentLayer - 1));
        if (targetLayer >= layers) continue;

        const targetStart = targetLayer * nodesPerLayer;
        const targetEnd = Math.min((targetLayer + 1) * nodesPerLayer, numNodes);
        const target = targetStart + Math.floor(Math.random() * (targetEnd - targetStart));

        if (
          target < numNodes &&
          target !== i &&
          !newEdges.some(e => e.from === i && e.to === target)
        ) {
          newEdges.push({ from: i, to: target, isProcessed: false });
        }
      }
    }

    // Calculate indegrees
    newEdges.forEach(edge => {
      newNodes[edge.to].indegree++;
    });

    setNodes(newNodes);
    setEdges(newEdges);
    setQueue([]);
    setTopologicalOrder([]);
    setCurrentStep("");
  };

  return (
    <div className="h-full flex flex-col p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Topological Sort (Indegree/Kahn&apos;s)</h2>
        <p className="text-muted-foreground">
          Orders vertices in a directed acyclic graph (DAG) using indegree counts and a queue.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Button onClick={runTopologicalSort} disabled={isRunning || !nodes.length}>
          <Play className="h-4 w-4 mr-2" />
          Run Sort
        </Button>
        <Button onClick={generateRandomDAG} disabled={isRunning} variant="outline">
          <Shuffle className="h-4 w-4 mr-2" />
          Random DAG
        </Button>
        <Button onClick={initializeGraph} disabled={isRunning} variant="outline">
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>

      {/* Graph Visualization */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-3xl bg-muted/20 rounded-lg p-4 mb-4">
          <svg className="w-full h-96" viewBox="0 0 600 500">
            {/* Edges with arrows */}
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 10 3, 0 6" fill="#94a3b8" />
              </marker>
              <marker
                id="arrowhead-processed"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 10 3, 0 6" fill="#3b82f6" />
              </marker>
            </defs>

            {edges.map((edge, index) => {
              const fromNode = nodes.find((n) => n.id === edge.from);
              const toNode = nodes.find((n) => n.id === edge.to);
              if (!fromNode || !toNode) return null;

              // Calculate arrow endpoint (stop at circle edge)
              const dx = toNode.x - fromNode.x;
              const dy = toNode.y - fromNode.y;
              const length = Math.sqrt(dx * dx + dy * dy);
              const unitX = dx / length;
              const unitY = dy / length;
              const endX = toNode.x - unitX * 28;
              const endY = toNode.y - unitY * 28;

              return (
                <motion.line
                  key={index}
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={endX}
                  y2={endY}
                  stroke={edge.isProcessed ? "#3b82f6" : "#94a3b8"}
                  strokeWidth={edge.isProcessed ? "3" : "2"}
                  markerEnd={edge.isProcessed ? "url(#arrowhead-processed)" : "url(#arrowhead)"}
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
                  r="25"
                  fill={
                    node.isProcessed
                      ? "#3b82f6"
                      : node.isCurrently
                      ? "#f59e0b"
                      : node.isInQueue
                      ? "#8b5cf6"
                      : "#e2e8f0"
                  }
                  stroke={
                    node.isCurrently
                      ? "#f59e0b"
                      : node.isInQueue
                      ? "#8b5cf6"
                      : node.isProcessed
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
                  fill={node.isProcessed || node.isCurrently || node.isInQueue ? "white" : "black"}
                >
                  {node.label}
                </text>

                {/* Indegree label */}
                <text
                  x={node.x}
                  y={node.y - 35}
                  textAnchor="middle"
                  className="text-xs font-medium select-none"
                  fill={node.indegree === 0 && !node.isProcessed ? "#10b981" : "#64748b"}
                >
                  in: {node.indegree}
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
        </div>

        {/* Info Panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-5xl">
          {/* Queue */}
          <div className="bg-muted/50 rounded-lg p-3">
            <h3 className="font-medium mb-2 text-sm">Queue (indegree = 0):</h3>
            <div className="space-y-1">
              {queue.length === 0 ? (
                <div className="text-xs text-muted-foreground">Empty</div>
              ) : (
                queue.map((nodeId, index) => (
                  <div key={index} className="text-xs bg-purple-100 text-purple-800 p-1 rounded">
                    {nodes[nodeId].label}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Topological Order */}
          <div className="bg-muted/50 rounded-lg p-3">
            <h3 className="font-medium mb-2 text-sm">Topological Order:</h3>
            <div className="text-xs">
              {topologicalOrder.length === 0 ? (
                <div className="text-muted-foreground">None yet</div>
              ) : (
                <div className="font-medium">{topologicalOrder.join(" → ")}</div>
              )}
            </div>
          </div>

          {/* Algorithm Properties */}
          <div className="bg-muted/50 rounded-lg p-3">
            <h3 className="font-medium mb-2 text-sm">Algorithm Properties:</h3>
            <div className="text-xs space-y-1">
              <div>• Kahn&apos;s algorithm</div>
              <div>• Uses indegree counts</div>
              <div>• Queue-based (BFS)</div>
              <div>• Time: O(V + E)</div>
              <div>• Detects cycles</div>
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
            <span>Not processed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
            <span>In queue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
            <span>Currently processing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <span>Processed</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-600 font-medium">in: 0</span>
            <span>Ready to process</span>
          </div>
        </div>
      </div>
    </div>
  );
}
