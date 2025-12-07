"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Link2, Search, RotateCcw, Network } from "lucide-react";

interface DisjointSetsVisualizationProps {
  speed: number;
}

interface SetNode {
  id: number;
  value: number;
  parent: number;
  rank: number;
  size: number;
  x?: number;
  y?: number;
  isHighlighted?: boolean;
  isPathCompressing?: boolean;
  isUniting?: boolean;
}

export default function DisjointSetsVisualization({
  speed,
}: DisjointSetsVisualizationProps) {
  const [nodes, setNodes] = useState<Map<number, SetNode>>(new Map());
  const [inputValue, setInputValue] = useState("");
  const [unionInput1, setUnionInput1] = useState("");
  const [unionInput2, setUnionInput2] = useState("");
  const [findInput, setFindInput] = useState("");
  const [operationInfo, setOperationInfo] = useState<string>("");
  const [pathCompressionPath, setPathCompressionPath] = useState<number[]>([]);

  // Find with path compression
  const find = useCallback(
    (nodeId: number, nodesMap: Map<number, SetNode>): number => {
      const node = nodesMap.get(nodeId);
      if (!node) return nodeId;

      if (node.parent !== nodeId) {
        // Path compression: make every node point directly to root
        const root = find(node.parent, nodesMap);
        const updatedNode = { ...node, parent: root };
        nodesMap.set(nodeId, updatedNode);
        return root;
      }
      return nodeId;
    },
    []
  );

  // Find with path visualization (no compression during visualization)
  const findWithPath = useCallback(
    (nodeId: number, nodesMap: Map<number, SetNode>): number[] => {
      const path: number[] = [];
      let current = nodeId;
      const node = nodesMap.get(current);
      if (!node) return path;

      while (current !== nodesMap.get(current)!.parent) {
        path.push(current);
        current = nodesMap.get(current)!.parent;
      }
      path.push(current); // Add root
      return path;
    },
    []
  );

  // Union by rank
  const union = useCallback(
    (x: number, y: number, nodesMap: Map<number, SetNode>): boolean => {
      const rootX = find(x, nodesMap);
      const rootY = find(y, nodesMap);

      if (rootX === rootY) {
        return false; // Already in same set
      }

      const nodeX = nodesMap.get(rootX)!;
      const nodeY = nodesMap.get(rootY)!;

      // Union by rank
      if (nodeX.rank < nodeY.rank) {
        nodesMap.set(rootX, { ...nodeX, parent: rootY });
        nodesMap.set(rootY, { ...nodeY, size: nodeY.size + nodeX.size });
      } else if (nodeX.rank > nodeY.rank) {
        nodesMap.set(rootY, { ...nodeY, parent: rootX });
        nodesMap.set(rootX, { ...nodeX, size: nodeX.size + nodeY.size });
      } else {
        nodesMap.set(rootY, { ...nodeY, parent: rootX });
        nodesMap.set(rootX, {
          ...nodeX,
          rank: nodeX.rank + 1,
          size: nodeX.size + nodeY.size,
        });
      }

      return true;
    },
    [find]
  );

  // Calculate positions for forest visualization
  const calculatePositions = useCallback((nodesMap: Map<number, SetNode>) => {
    const newNodesMap = new Map(nodesMap);
    
    // Group nodes by their root
    const trees = new Map<number, number[]>();
    nodesMap.forEach((node, id) => {
      const root = find(id, new Map(nodesMap));
      if (!trees.has(root)) {
        trees.set(root, []);
      }
      trees.get(root)!.push(id);
    });

    // Position each tree horizontally with better spacing
    let currentX = 100;
    const treeSpacing = 200;
    const levelHeight = 100;
    const horizontalSpacing = 80;

    trees.forEach((treeNodes, root) => {
      // Build tree structure - map parent to children
      const children = new Map<number, number[]>();
      treeNodes.forEach((nodeId) => {
        const node = nodesMap.get(nodeId)!;
        if (node.parent !== nodeId) {
          if (!children.has(node.parent)) {
            children.set(node.parent, []);
          }
          children.get(node.parent)!.push(nodeId);
        }
      });

      // Calculate tree width by counting nodes at each level
      const getTreeWidth = (nodeId: number, level: number, widths: Map<number, number>) => {
        const currentWidth = widths.get(level) || 0;
        widths.set(level, currentWidth + 1);
        
        const nodeChildren = children.get(nodeId) || [];
        nodeChildren.forEach(childId => {
          getTreeWidth(childId, level + 1, widths);
        });
      };

      const levelWidths = new Map<number, number>();
      getTreeWidth(root, 0, levelWidths);
      const maxWidth = Math.max(...Array.from(levelWidths.values()));
      const treeWidth = maxWidth * horizontalSpacing;

      // Position nodes level by level
      const positionNode = (nodeId: number, x: number, y: number, level: number) => {
        const node = newNodesMap.get(nodeId)!;
        newNodesMap.set(nodeId, { ...node, x, y });

        const nodeChildren = children.get(nodeId) || [];
        if (nodeChildren.length === 0) return;

        // Calculate spacing for children
        const childrenWidth = nodeChildren.length * horizontalSpacing;
        let childX = x - childrenWidth / 2 + horizontalSpacing / 2;

        nodeChildren.forEach((childId) => {
          positionNode(childId, childX, y + levelHeight, level + 1);
          childX += horizontalSpacing;
        });
      };

      // Start positioning from root at center of tree space
      positionNode(root, currentX + treeWidth / 2, 50, 0);
      
      // Move to next tree position
      currentX += treeWidth + treeSpacing;
    });

    return newNodesMap;
  }, [find]);

  // Make set (add new element)
  const makeSet = useCallback(() => {
    const value = parseInt(inputValue);
    if (isNaN(value) || nodes.has(value)) {
      if (nodes.has(value)) {
        setOperationInfo(`Element ${value} already exists`);
        setTimeout(() => setOperationInfo(""), 2000);
      }
      return;
    }

    const newNode: SetNode = {
      id: value,
      value,
      parent: value,
      rank: 0,
      size: 1,
      isHighlighted: true,
    };

    const newNodesMap = new Map(nodes);
    newNodesMap.set(value, newNode);
    const positioned = calculatePositions(newNodesMap);
    setNodes(positioned);
    setInputValue("");

    setOperationInfo(`Created set with element ${value}`);
    setTimeout(() => {
      setOperationInfo("");
      setNodes((prev) => {
        const updated = new Map(prev);
        const node = updated.get(value);
        if (node) {
          updated.set(value, { ...node, isHighlighted: false });
        }
        return updated;
      });
    }, 1000 / speed);
  }, [inputValue, nodes, calculatePositions, speed]);

  // Perform union operation
  const performUnion = useCallback(async () => {
    const x = parseInt(unionInput1);
    const y = parseInt(unionInput2);

    if (isNaN(x) || isNaN(y) || !nodes.has(x) || !nodes.has(y)) {
      setOperationInfo("Invalid elements for union");
      setTimeout(() => setOperationInfo(""), 2000);
      return;
    }

    const newNodesMap = new Map(nodes);
    const rootX = find(x, newNodesMap);
    const rootY = find(y, newNodesMap);

    if (rootX === rootY) {
      setOperationInfo(`${x} and ${y} are already in the same set`);
      setTimeout(() => setOperationInfo(""), 2000);
      return;
    }

    // Highlight nodes being united
    const nodeX = newNodesMap.get(x);
    const nodeY = newNodesMap.get(y);
    if (nodeX) newNodesMap.set(x, { ...nodeX, isUniting: true });
    if (nodeY) newNodesMap.set(y, { ...nodeY, isUniting: true });
    setNodes(calculatePositions(newNodesMap));

    await new Promise((resolve) =>
      setTimeout(resolve, Math.max(500, 800 / speed))
    );

    // Perform union
    const success = union(x, y, newNodesMap);
    if (success) {
      const finalRoot = find(x, newNodesMap);
      const rootNode = newNodesMap.get(finalRoot);
      setOperationInfo(
        `United sets containing ${x} and ${y}. New root: ${finalRoot}, Size: ${rootNode?.size}`
      );
    }

    // Clear highlights
    newNodesMap.forEach((node, id) => {
      newNodesMap.set(id, { ...node, isUniting: false });
    });

    setNodes(calculatePositions(newNodesMap));
    setUnionInput1("");
    setUnionInput2("");

    setTimeout(() => setOperationInfo(""), 3000);
  }, [unionInput1, unionInput2, nodes, find, union, calculatePositions, speed]);

  // Perform find operation with path compression visualization
  const performFind = useCallback(async () => {
    const value = parseInt(findInput);
    if (isNaN(value) || !nodes.has(value)) {
      setOperationInfo("Element not found");
      setTimeout(() => setOperationInfo(""), 2000);
      return;
    }

    const newNodesMap = new Map(nodes);
    
    // Get path before compression
    const path = findWithPath(value, newNodesMap);
    setPathCompressionPath(path);

    // Highlight path
    path.forEach((nodeId) => {
      const node = newNodesMap.get(nodeId);
      if (node) {
        newNodesMap.set(nodeId, { ...node, isPathCompressing: true });
      }
    });
    setNodes(calculatePositions(newNodesMap));

    await new Promise((resolve) =>
      setTimeout(resolve, Math.max(800, 1200 / speed))
    );

    // Perform find with path compression
    const root = find(value, newNodesMap);
    const rootNode = newNodesMap.get(root);
    setOperationInfo(
      `Found root: ${root}, Set size: ${rootNode?.size}, Path compressed!`
    );

    // Clear highlights
    newNodesMap.forEach((node, id) => {
      newNodesMap.set(id, { ...node, isPathCompressing: false });
    });

    setNodes(calculatePositions(newNodesMap));
    setFindInput("");

    setTimeout(() => {
      setOperationInfo("");
      setPathCompressionPath([]);
    }, 3000);
  }, [findInput, nodes, find, findWithPath, calculatePositions, speed]);

  // Clear all sets
  const clearSets = () => {
    setNodes(new Map());
    setOperationInfo("");
    setPathCompressionPath([]);
  };

  // Demo
  const runDemo = () => {
    clearSets();
    const demoNodes = new Map<number, SetNode>();

    // Create initial sets
    [1, 2, 3, 4, 5, 6, 7, 8].forEach((val) => {
      demoNodes.set(val, {
        id: val,
        value: val,
        parent: val,
        rank: 0,
        size: 1,
      });
    });

    let currentNodes = calculatePositions(demoNodes);
    setNodes(currentNodes);

    // Perform unions with delays
    const operations = [
      { type: "union", x: 1, y: 2, delay: 1000 },
      { type: "union", x: 3, y: 4, delay: 2000 },
      { type: "union", x: 5, y: 6, delay: 3000 },
      { type: "union", x: 7, y: 8, delay: 4000 },
      { type: "union", x: 1, y: 3, delay: 5000 },
      { type: "union", x: 5, y: 7, delay: 6000 },
      { type: "union", x: 1, y: 5, delay: 7000 },
    ];

    operations.forEach(({ x, y, delay }) => {
      setTimeout(() => {
        const newNodesMap = new Map(currentNodes);
        union(x, y, newNodesMap);
        currentNodes = calculatePositions(newNodesMap);
        setNodes(currentNodes);
        setOperationInfo(`United ${x} and ${y}`);
        setTimeout(() => setOperationInfo(""), 1000);
      }, delay);
    });
  };

  // Render connections (parent pointers)
  const renderConnections = (): React.ReactElement[] => {
    const connections: React.ReactElement[] = [];
    const nodeRadius = 20;

    nodes.forEach((node) => {
      if (
        node.parent !== node.id &&
        node.x !== undefined &&
        node.y !== undefined
      ) {
        const parent = nodes.get(node.parent);
        if (parent && parent.x !== undefined && parent.y !== undefined) {
          const isInPath = pathCompressionPath.includes(node.id) &&
            pathCompressionPath.includes(parent.id);

          connections.push(
            <motion.g key={`${node.id}-${parent.id}`}>
              {/* Arrow line */}
              <motion.line
                x1={node.x}
                y1={node.y - nodeRadius}
                x2={parent.x}
                y2={parent.y + nodeRadius}
                stroke={isInPath ? "#f59e0b" : "#94a3b8"}
                strokeWidth={isInPath ? "3" : "2"}
                markerEnd={`url(#arrowhead-${isInPath ? "highlight" : "normal"})`}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5 }}
              />
            </motion.g>
          );
        }
      }
    });

    return connections;
  };

  // Render nodes
  const renderNodes = (): React.ReactElement[] => {
    const elements: React.ReactElement[] = [];
    const nodeRadius = 20;

    nodes.forEach((node) => {
      if (node.x === undefined || node.y === undefined) return;

      const isRoot = node.parent === node.id;
      let nodeColor, textColor, strokeColor;

      if (node.isUniting) {
        nodeColor = "#8b5cf6"; // Purple for uniting
        textColor = "white";
        strokeColor = "#8b5cf6";
      } else if (node.isPathCompressing) {
        nodeColor = "#f59e0b"; // Orange for path compression
        textColor = "white";
        strokeColor = "#f59e0b";
      } else if (node.isHighlighted) {
        nodeColor = "#3b82f6"; // Blue for newly created
        textColor = "white";
        strokeColor = "#3b82f6";
      } else if (isRoot) {
        nodeColor = "#10b981"; // Green for roots
        textColor = "white";
        strokeColor = "#10b981";
      } else {
        nodeColor = "#e2e8f0";
        textColor = "#1e293b";
        strokeColor = "#94a3b8";
      }

      elements.push(
        <motion.g
          key={node.id}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 / speed, ease: "easeOut" }}
        >
          {/* Main node circle */}
          <circle
            cx={node.x}
            cy={node.y}
            r={nodeRadius}
            fill={nodeColor}
            stroke={strokeColor}
            strokeWidth="2"
          />

          {/* Node value */}
          <text
            x={node.x}
            y={node.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="font-semibold select-none"
            fill={textColor}
            fontSize="14"
          >
            {node.value}
          </text>

          {/* Root indicator with rank and size */}
          {isRoot && (
            <>
              <text
                x={node.x}
                y={node.y - nodeRadius - 8}
                textAnchor="middle"
                className="font-mono select-none text-xs fill-green-500"
                fontSize="10"
              >
                Root
              </text>
              <text
                x={node.x}
                y={node.y + nodeRadius + 12}
                textAnchor="middle"
                className="font-mono select-none text-xs fill-muted-foreground"
                fontSize="9"
              >
                r:{node.rank} s:{node.size}
              </text>
            </>
          )}
        </motion.g>
      );
    });

    return elements;
  };

  const getSetCount = (): number => {
    const roots = new Set<number>();
    nodes.forEach((node) => {
      const root = find(node.id, new Map(nodes));
      roots.add(root);
    });
    return roots.size;
  };

  return (
    <div className="h-full flex flex-col p-2 sm:p-0">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-2 text-foreground">
          Disjoint Sets (Union-Find)
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Efficiently track disjoint sets with union by rank and path
          compression for near-constant time operations.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 flex-1">
        {/* Controls */}
        <div className="w-full lg:w-80 space-y-3 lg:space-y-4 order-2 lg:order-1 max-h-[50vh] lg:max-h-none overflow-y-auto lg:overflow-visible">
          <div className="space-y-2">
            <label className="text-sm font-medium">Make Set (Add Element)</label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter number..."
                onKeyDown={(e) => e.key === "Enter" && makeSet()}
              />
              <Button onClick={makeSet} disabled={!inputValue.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Union (Merge Sets)</label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={unionInput1}
                onChange={(e) => setUnionInput1(e.target.value)}
                placeholder="Element 1"
                className="flex-1"
              />
              <Input
                type="number"
                value={unionInput2}
                onChange={(e) => setUnionInput2(e.target.value)}
                placeholder="Element 2"
                className="flex-1"
              />
              <Button
                onClick={performUnion}
                disabled={
                  !unionInput1.trim() || !unionInput2.trim() || nodes.size === 0
                }
              >
                <Link2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Find (with Path Compression)
            </label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={findInput}
                onChange={(e) => setFindInput(e.target.value)}
                placeholder="Find element..."
                onKeyDown={(e) => e.key === "Enter" && performFind()}
              />
              <Button
                onClick={performFind}
                disabled={!findInput.trim() || nodes.size === 0}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={clearSets}
              disabled={nodes.size === 0}
              variant="outline"
              className="flex-1"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear
            </Button>
            <Button onClick={runDemo} variant="outline" className="flex-1">
              Demo
            </Button>
          </div>

          {operationInfo && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">{operationInfo}</p>
            </div>
          )}

          {/* Legend */}
          {nodes.size > 0 && (
            <div className="p-3 bg-muted/50 rounded-lg space-y-2">
              <div className="text-sm font-medium">Node Types:</div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>Set representative (root)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span>Being united</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span>Path compression</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span>Newly created</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: "#f8fafc",
                      border: "1px solid #64748b",
                    }}
                  ></div>
                  <span>Regular nodes</span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Arrows point from child to parent. Root shows rank (r) and size
                (s).
              </div>
            </div>
          )}

          {/* Stats */}
          {nodes.size > 0 && (
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span>Elements: {nodes.size}</span>
                <span>Disjoint Sets: {getSetCount()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Visualization */}
        <div className="flex-1 relative min-h-[300px] lg:min-h-[400px] order-1 lg:order-2 bg-card rounded-lg border overflow-auto">
          {nodes.size > 0 ? (
            <div className="w-full h-full p-4 bg-card overflow-auto">
              <svg
                className="w-full h-full min-w-[800px] min-h-[500px]"
                viewBox="0 0 1200 600"
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  <marker
                    id="arrowhead-normal"
                    markerWidth="10"
                    markerHeight="10"
                    refX="9"
                    refY="3"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 10 3, 0 6"
                      className="fill-muted-foreground"
                    />
                  </marker>
                  <marker
                    id="arrowhead-highlight"
                    markerWidth="10"
                    markerHeight="10"
                    refX="9"
                    refY="3"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 10 3, 0 6"
                      fill="#f59e0b"
                    />
                  </marker>
                </defs>
                <g>
                  {renderConnections()}
                  {renderNodes()}
                </g>
              </svg>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <Network className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4 opacity-40" />
                <p className="text-sm sm:text-base font-medium mb-2">
                  Add elements to create disjoint sets
                </p>
                <p className="text-xs sm:text-sm opacity-60">
                  Use Union to merge sets, Find to locate representatives
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
