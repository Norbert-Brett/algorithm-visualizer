"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, Shuffle } from "lucide-react";

interface ConnectedComponentsVisualizationProps {
  speed: number;
}

interface GraphNode {
  id: number;
  x: number;
  y: number;
  component: number;
  isVisited: boolean;
  isCurrently: boolean;
}

interface GraphEdge {
  from: number;
  to: number;
  isTraversed: boolean;
}

const COMPONENT_COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#8b5cf6", // purple
  "#ef4444", // red
  "#06b6d4", // cyan
  "#ec4899", // pink
  "#84cc16", // lime
];

export default function ConnectedComponentsVisualization({ speed }: ConnectedComponentsVisualizationProps) {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [componentCount, setComponentCount] = useState(0);
  const [componentSizes, setComponentSizes] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState("");

  // Initialize graph with multiple components
  const initializeGraph = useCallback(() => {
    const newNodes: GraphNode[] = [
      // Component 1
      { id: 0, x: 100, y: 100, component: -1, isVisited: false, isCurrently: false },
      { id: 1, x: 200, y: 100, component: -1, isVisited: false, isCurrently: false },
      { id: 2, x: 150, y: 200, component: -1, isVisited: false, isCurrently: false },
      // Component 2
      { id: 3, x: 350, y: 100, component: -1, isVisited: false, isCurrently: false },
      { id: 4, x: 450, y: 100, component: -1, isVisited: false, isCurrently: false },
      { id: 5, x: 400, y: 200, component: -1, isVisited: false, isCurrently: false },
      { id: 6, x: 350, y: 250, component: -1, isVisited: false, isCurrently: false },
      // Component 3
      { id: 7, x: 250, y: 300, component: -1, isVisited: false, isCurrently: false },
      { id: 8, x: 150, y: 350, component: -1, isVisited: false, isCurrently: false },
    ];

    const newEdges: GraphEdge[] = [
      // Component 1 edges
      { from: 0, to: 1, isTraversed: false },
      { from: 1, to: 2, isTraversed: false },
      { from: 2, to: 0, isTraversed: false },
      // Component 2 edges
      { from: 3, to: 4, isTraversed: false },
      { from: 4, to: 5, isTraversed: false },
      { from: 5, to: 6, isTraversed: false },
      { from: 6, to: 3, isTraversed: false },
      // Component 3 edges
      { from: 7, to: 8, isTraversed: false },
    ];

    setNodes(newNodes);
    setEdges(newEdges);
    setComponentCount(0);
    setComponentSizes([]);
    setCurrentStep("");
  }, []);

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
    return adjacent.sort();
  }, [edges]);

  // DFS to explore a component
  const dfsComponent = useCallback(async (
    startNode: number,
    componentId: number,
    visited: Set<number>,
    nodesCopy: GraphNode[]
  ): Promise<number> => {
    const stack = [startNode];
    let size = 0;

    while (stack.length > 0) {
      const current = stack.pop()!;

      if (visited.has(current)) continue;

      visited.add(current);
      size++;

      // Mark node with component
      nodesCopy.forEach(node => {
        if (node.id === current) {
          node.component = componentId;
          node.isVisited = true;
          node.isCurrently = true;
        } else {
          node.isCurrently = false;
        }
      });

      setNodes([...nodesCopy]);
      setCurrentStep(`Exploring node ${current} in component ${componentId + 1}`);

      await new Promise(resolve => setTimeout(resolve, Math.max(400, 800 / speed)));

      // Get unvisited neighbors
      const neighbors = getAdjacent(current);
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
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

      await new Promise(resolve => setTimeout(resolve, Math.max(300, 600 / speed)));
    }

    // Clear currently highlighting
    nodesCopy.forEach(node => {
      node.isCurrently = false;
    });
    setNodes([...nodesCopy]);

    return size;
  }, [edges, speed, getAdjacent]);

  // Find all connected components
  const findConnectedComponents = useCallback(async () => {
    if (!nodes.length || isSearching) return;

    setIsSearching(true);
    setCurrentStep("Starting connected components search...");

    // Reset all nodes and edges
    const nodesCopy = nodes.map(node => ({
      ...node,
      component: -1,
      isVisited: false,
      isCurrently: false,
    }));
    setNodes(nodesCopy);
    setEdges(prev => prev.map(edge => ({ ...edge, isTraversed: false })));

    await new Promise(resolve => setTimeout(resolve, Math.max(500, 1000 / speed)));

    const visited = new Set<number>();
    let componentId = 0;
    const sizes: number[] = [];

    for (const node of nodesCopy) {
      if (!visited.has(node.id)) {
        setCurrentStep(`Found new component ${componentId + 1}, starting from node ${node.id}`);
        await new Promise(resolve => setTimeout(resolve, Math.max(500, 1000 / speed)));

        const size = await dfsComponent(node.id, componentId, visited, nodesCopy);
        sizes.push(size);

        setCurrentStep(`Component ${componentId + 1} complete: ${size} nodes`);
        await new Promise(resolve => setTimeout(resolve, Math.max(600, 1200 / speed)));

        componentId++;
      }
    }

    setComponentCount(componentId);
    setComponentSizes(sizes);
    setCurrentStep(`Found ${componentId} connected component${componentId !== 1 ? 's' : ''}`);
    setIsSearching(false);
  }, [nodes, isSearching, speed, dfsComponent]);

  const generateRandomGraph = () => {
    if (isSearching) return;

    // Generate 2-4 components
    const numComponents = Math.floor(Math.random() * 3) + 2;
    const newNodes: GraphNode[] = [];
    const newEdges: GraphEdge[] = [];
    let nodeId = 0;

    for (let comp = 0; comp < numComponents; comp++) {
      // 2-4 nodes per component
      const nodesInComp = Math.floor(Math.random() * 3) + 2;
      const compNodes: number[] = [];

      // Position nodes in a cluster
      const centerX = 100 + (comp * 200) + Math.random() * 100;
      const centerY = 150 + Math.random() * 150;

      for (let i = 0; i < nodesInComp && nodeId < 12; i++) {
        const angle = (i / nodesInComp) * 2 * Math.PI;
        const radius = 50 + Math.random() * 30;
        newNodes.push({
          id: nodeId,
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
          component: -1,
          isVisited: false,
          isCurrently: false,
        });
        compNodes.push(nodeId);
        nodeId++;
      }

      // Connect nodes within component
      for (let i = 0; i < compNodes.length; i++) {
        const connectTo = compNodes[(i + 1) % compNodes.length];
        newEdges.push({ from: compNodes[i], to: connectTo, isTraversed: false });

        // Add some extra edges
        if (Math.random() > 0.5 && compNodes.length > 2) {
          const randomNode = compNodes[Math.floor(Math.random() * compNodes.length)];
          if (randomNode !== compNodes[i] && randomNode !== connectTo) {
            newEdges.push({ from: compNodes[i], to: randomNode, isTraversed: false });
          }
        }
      }
    }

    setNodes(newNodes);
    setEdges(newEdges);
    setComponentCount(0);
    setComponentSizes([]);
    setCurrentStep("");
  };

  return (
    <div className="h-full flex flex-col p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Connected Components</h2>
        <p className="text-muted-foreground">
          Find all connected components in an undirected graph using depth-first search.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Button onClick={findConnectedComponents} disabled={isSearching || !nodes.length}>
          <Play className="h-4 w-4 mr-2" />
          Find Components
        </Button>
        <Button onClick={generateRandomGraph} disabled={isSearching} variant="outline">
          <Shuffle className="h-4 w-4 mr-2" />
          Random Graph
        </Button>
        <Button onClick={initializeGraph} disabled={isSearching} variant="outline">
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
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

              const color = fromNode.component >= 0 && fromNode.component === toNode.component
                ? COMPONENT_COLORS[fromNode.component % COMPONENT_COLORS.length]
                : "#94a3b8";

              return (
                <motion.line
                  key={index}
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke={color}
                  strokeWidth={edge.isTraversed ? "3" : "2"}
                  opacity={edge.isTraversed ? 1 : 0.5}
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
                  r="22"
                  fill={
                    node.component >= 0
                      ? COMPONENT_COLORS[node.component % COMPONENT_COLORS.length]
                      : "#e2e8f0"
                  }
                  stroke={
                    node.isCurrently
                      ? "#f59e0b"
                      : node.component >= 0
                      ? COMPONENT_COLORS[node.component % COMPONENT_COLORS.length]
                      : "#64748b"
                  }
                  strokeWidth={node.isCurrently ? "4" : "2"}
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
                  fill={node.component >= 0 ? "white" : "black"}
                >
                  {node.id}
                </text>

                {/* Component label */}
                {node.component >= 0 && (
                  <text
                    x={node.x}
                    y={node.y - 30}
                    textAnchor="middle"
                    className="text-xs font-medium select-none"
                    fill={COMPONENT_COLORS[node.component % COMPONENT_COLORS.length]}
                  >
                    C{node.component + 1}
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
          {componentCount > 0 && (
            <div className="text-lg font-medium text-green-600">
              Total: {componentCount} component{componentCount !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Component Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
          {/* Component Sizes */}
          <div className="bg-muted/50 rounded-lg p-3">
            <h3 className="font-medium mb-2 text-sm">Component Sizes:</h3>
            <div className="space-y-1">
              {componentSizes.length === 0 ? (
                <div className="text-xs text-muted-foreground">Run algorithm to see results</div>
              ) : (
                componentSizes.map((size, index) => (
                  <div key={index} className="text-xs flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COMPONENT_COLORS[index % COMPONENT_COLORS.length] }}
                    ></div>
                    <span>Component {index + 1}: {size} node{size !== 1 ? 's' : ''}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Algorithm Properties */}
          <div className="bg-muted/50 rounded-lg p-3">
            <h3 className="font-medium mb-2 text-sm">Algorithm Properties:</h3>
            <div className="text-xs space-y-1">
              <div>• Uses DFS traversal</div>
              <div>• Finds all components</div>
              <div>• Time: O(V + E)</div>
              <div>• Space: O(V)</div>
              <div>• Works on undirected graphs</div>
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
            <div className="w-4 h-4 bg-yellow-500 rounded-full border-4 border-yellow-500"></div>
            <span>Currently exploring</span>
          </div>
          {COMPONENT_COLORS.slice(0, 4).map((color, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }}></div>
              <span>Component {index + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
