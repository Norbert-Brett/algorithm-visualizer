"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, Shuffle } from "lucide-react";

interface TopologicalSortDFSVisualizationProps {
  speed: number;
}

interface GraphNode {
  id: number;
  label: string;
  x: number;
  y: number;
  state: "unvisited" | "visiting" | "visited";
  finishTime: number;
}

interface GraphEdge {
  from: number;
  to: number;
  isInPath: boolean;
}

export default function TopologicalSortDFSVisualization({ speed }: TopologicalSortDFSVisualizationProps) {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState("");
  const [stack, setStack] = useState<string[]>([]);
  const [topologicalOrder, setTopologicalOrder] = useState<string[]>([]);
  const [finishTimeCounter, setFinishTimeCounter] = useState(0);

  // Initialize DAG
  const initializeGraph = useCallback(() => {
    const newNodes: GraphNode[] = [
      { id: 0, label: "A", x: 100, y: 100, state: "unvisited", finishTime: 0 },
      { id: 1, label: "B", x: 300, y: 100, state: "unvisited", finishTime: 0 },
      { id: 2, label: "C", x: 500, y: 100, state: "unvisited", finishTime: 0 },
      { id: 3, label: "D", x: 200, y: 250, state: "unvisited", finishTime: 0 },
      { id: 4, label: "E", x: 400, y: 250, state: "unvisited", finishTime: 0 },
      { id: 5, label: "F", x: 300, y: 400, state: "unvisited", finishTime: 0 },
    ];

    const newEdges: GraphEdge[] = [
      { from: 0, to: 3, isInPath: false },
      { from: 0, to: 4, isInPath: false },
      { from: 1, to: 3, isInPath: false },
      { from: 1, to: 4, isInPath: false },
      { from: 2, to: 4, isInPath: false },
      { from: 3, to: 5, isInPath: false },
      { from: 4, to: 5, isInPath: false },
    ];

    setNodes(newNodes);
    setEdges(newEdges);
    setStack([]);
    setTopologicalOrder([]);
    setCurrentStep("");
    setFinishTimeCounter(0);
  }, []);

  useEffect(() => {
    initializeGraph();
  }, [initializeGraph]);

  // Get adjacent nodes
  const getAdjacent = useCallback((nodeId: number): number[] => {
    return edges
      .filter(edge => edge.from === nodeId)
      .map(edge => edge.to)
      .sort();
  }, [edges]);

  // DFS visit function
  const dfsVisit = useCallback(async (
    nodeId: number,
    nodesCopy: GraphNode[],
    stackCopy: string[],
    finishTime: number
  ): Promise<number> => {
    // Mark as visiting
    nodesCopy[nodeId].state = "visiting";
    setNodes([...nodesCopy]);
    setCurrentStep(`Visiting node ${nodesCopy[nodeId].label}`);

    await new Promise(resolve => setTimeout(resolve, Math.max(600, 1200 / speed)));

    // Explore neighbors
    const neighbors = getAdjacent(nodeId);
    
    for (const neighbor of neighbors) {
      if (nodesCopy[neighbor].state === "unvisited") {
        // Highlight edge
        setEdges(prev => prev.map(edge => ({
          ...edge,
          isInPath: edge.isInPath || (edge.from === nodeId && edge.to === neighbor),
        })));

        setCurrentStep(`Exploring edge ${nodesCopy[nodeId].label} → ${nodesCopy[neighbor].label}`);
        await new Promise(resolve => setTimeout(resolve, Math.max(400, 800 / speed)));

        finishTime = await dfsVisit(neighbor, nodesCopy, stackCopy, finishTime);
      } else if (nodesCopy[neighbor].state === "visiting") {
        // Back edge detected - cycle!
        setCurrentStep(`Warning: Back edge detected ${nodesCopy[nodeId].label} → ${nodesCopy[neighbor].label} (cycle!)`);
        await new Promise(resolve => setTimeout(resolve, Math.max(800, 1600 / speed)));
      }
    }

    // Mark as visited and assign finish time
    nodesCopy[nodeId].state = "visited";
    finishTime++;
    nodesCopy[nodeId].finishTime = finishTime;
    
    // Add to stack (topological order)
    stackCopy.unshift(nodesCopy[nodeId].label);
    setStack([...stackCopy]);
    setNodes([...nodesCopy]);
    setFinishTimeCounter(finishTime);

    setCurrentStep(`Finished node ${nodesCopy[nodeId].label} (finish time: ${finishTime})`);
    await new Promise(resolve => setTimeout(resolve, Math.max(600, 1200 / speed)));

    // Clear edge highlighting
    setEdges(prev => prev.map(edge => ({
      ...edge,
      isInPath: false,
    })));

    return finishTime;
  }, [edges, speed, getAdjacent]);

  // Topological sort using DFS
  const runTopologicalSort = useCallback(async () => {
    if (!nodes.length || isRunning) return;

    setIsRunning(true);
    setCurrentStep("Starting topological sort (DFS-based)");
    setTopologicalOrder([]);
    setStack([]);
    setFinishTimeCounter(0);

    // Reset nodes
    const nodesCopy = nodes.map(node => ({
      ...node,
      state: "unvisited" as const,
      finishTime: 0,
    }));

    setNodes(nodesCopy);
    setEdges(prev => prev.map(edge => ({ ...edge, isInPath: false })));

    await new Promise(resolve => setTimeout(resolve, Math.max(500, 1000 / speed)));

    const stackCopy: string[] = [];
    let finishTime = 0;

    // Visit all unvisited nodes
    for (const node of nodesCopy) {
      if (node.state === "unvisited") {
        setCurrentStep(`Starting DFS from node ${node.label}`);
        await new Promise(resolve => setTimeout(resolve, Math.max(500, 1000 / speed)));
        
        finishTime = await dfsVisit(node.id, nodesCopy, stackCopy, finishTime);
      }
    }

    // Stack now contains topological order
    setTopologicalOrder([...stackCopy]);
    setCurrentStep(`Topological sort complete! Order: ${stackCopy.join(" → ")}`);
    setIsRunning(false);
  }, [nodes, isRunning, speed, dfsVisit]);

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
        state: "unvisited",
        finishTime: 0,
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
          newEdges.push({ from: i, to: target, isInPath: false });
        }
      }
    }

    setNodes(newNodes);
    setEdges(newEdges);
    setStack([]);
    setTopologicalOrder([]);
    setCurrentStep("");
    setFinishTimeCounter(0);
  };

  return (
    <div className="h-full flex flex-col p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Topological Sort (DFS-based)</h2>
        <p className="text-muted-foreground">
          Orders vertices in a directed acyclic graph (DAG) using depth-first search and finish times.
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
                id="arrowhead-dfs"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 10 3, 0 6" fill="#94a3b8" />
              </marker>
              <marker
                id="arrowhead-path"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 10 3, 0 6" fill="#f59e0b" />
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
                  stroke={edge.isInPath ? "#f59e0b" : "#94a3b8"}
                  strokeWidth={edge.isInPath ? "3" : "2"}
                  markerEnd={edge.isInPath ? "url(#arrowhead-path)" : "url(#arrowhead-dfs)"}
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
                    node.state === "visited"
                      ? "#3b82f6"
                      : node.state === "visiting"
                      ? "#f59e0b"
                      : "#e2e8f0"
                  }
                  stroke={
                    node.state === "visiting"
                      ? "#f59e0b"
                      : node.state === "visited"
                      ? "#3b82f6"
                      : "#64748b"
                  }
                  strokeWidth="2"
                  initial={{ scale: 0 }}
                  animate={{
                    scale: node.state === "visiting" ? 1.2 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                />

                {/* Node label */}
                <text
                  x={node.x}
                  y={node.y + 5}
                  textAnchor="middle"
                  className="text-sm font-bold select-none"
                  fill={node.state !== "unvisited" ? "white" : "black"}
                >
                  {node.label}
                </text>

                {/* Finish time */}
                {node.finishTime > 0 && (
                  <text
                    x={node.x}
                    y={node.y - 35}
                    textAnchor="middle"
                    className="text-xs font-medium select-none"
                    fill="#3b82f6"
                  >
                    f: {node.finishTime}
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
        </div>

        {/* Info Panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-5xl">
          {/* Stack (Topological Order) */}
          <div className="bg-muted/50 rounded-lg p-3">
            <h3 className="font-medium mb-2 text-sm">Stack (by finish time):</h3>
            <div className="space-y-1">
              {stack.length === 0 ? (
                <div className="text-xs text-muted-foreground">Empty</div>
              ) : (
                stack.map((label, index) => (
                  <div
                    key={index}
                    className={`text-xs p-1 rounded ${
                      index === 0 ? "bg-blue-100 text-blue-800 font-medium" : "bg-gray-100"
                    }`}
                  >
                    {label} {index === 0 && "← Top"}
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
              <div>• DFS-based approach</div>
              <div>• Uses finish times</div>
              <div>• Stack for ordering</div>
              <div>• Time: O(V + E)</div>
              <div>• Detects back edges</div>
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
            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
            <span>Visiting (in DFS)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <span>Visited (finished)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 bg-yellow-500"></div>
            <span>Current DFS path</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-600 font-medium text-xs">f: n</span>
            <span>Finish time</span>
          </div>
        </div>
      </div>
    </div>
  );
}
