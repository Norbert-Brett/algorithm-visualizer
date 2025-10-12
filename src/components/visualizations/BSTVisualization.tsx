"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Plus, Minus, Search, RotateCcw, Binary } from "lucide-react";

interface BSTVisualizationProps {
  isPlaying: boolean;
  speed: number;
}

interface TreeNode {
  id: number;
  value: number;
  left?: TreeNode | null;
  right?: TreeNode | null;
  x?: number;
  y?: number;
  isHighlighted?: boolean;
  isSearching?: boolean;
}

export default function BSTVisualization({ speed }: BSTVisualizationProps) {
  const [root, setRoot] = useState<TreeNode | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [nextId, setNextId] = useState(0);
  const [searchPath, setSearchPath] = useState<number[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<string>("");
  const [currentSearchNode, setCurrentSearchNode] = useState<number | null>(
    null
  );

  // Calculate positions for tree nodes with improved spacing
  const calculatePositions = useCallback(
    (node: TreeNode | null, x = 400, y = 100, level = 0): TreeNode | null => {
      if (!node) return null;

      // Dynamic spacing that provides better visual separation
      const baseSpacing = 120;
      const spacing = Math.max(60, baseSpacing / Math.pow(1.4, level));
      const verticalSpacing = 90;

      const newNode = { ...node, x, y };

      if (node.left) {
        newNode.left = calculatePositions(
          node.left,
          x - spacing,
          y + verticalSpacing,
          level + 1
        );
      }

      if (node.right) {
        newNode.right = calculatePositions(
          node.right,
          x + spacing,
          y + verticalSpacing,
          level + 1
        );
      }

      return newNode;
    },
    []
  );

  // Insert a value into the BST
  const insertNode = useCallback(
    (node: TreeNode | null, value: number, currentId: number): TreeNode => {
      if (!node) {
        return {
          id: currentId,
          value,
          isHighlighted: true,
          x: 0,
          y: 0,
        };
      }

      if (value < node.value) {
        return {
          ...node,
          left: insertNode(node.left || null, value, currentId),
        };
      } else if (value > node.value) {
        return {
          ...node,
          right: insertNode(node.right || null, value, currentId),
        };
      }

      return node; // Value already exists
    },
    []
  );

  // Delete a node from the BST
  const deleteNode = (
    node: TreeNode | null,
    value: number
  ): TreeNode | null => {
    if (!node) return null;

    if (value < node.value) {
      return {
        ...node,
        left: deleteNode(node.left || null, value),
      };
    } else if (value > node.value) {
      return {
        ...node,
        right: deleteNode(node.right || null, value),
      };
    } else {
      // Node to be deleted found
      if (!node.left && !node.right) {
        return null;
      }

      if (!node.left) {
        return node.right || null;
      }

      if (!node.right) {
        return node.left || null;
      }

      // Node has two children - find inorder successor
      const findMin = (n: TreeNode): TreeNode => {
        while (n.left) n = n.left;
        return n;
      };

      const successor = findMin(node.right);
      return {
        ...node,
        value: successor.value,
        right: deleteNode(node.right || null, successor.value),
      };
    }
  };

  // Clear highlights helper
  const clearHighlights = useCallback((node: TreeNode): TreeNode => {
    return {
      ...node,
      isHighlighted: false,
      isSearching: false,
      left: node.left ? clearHighlights(node.left) : null,
      right: node.right ? clearHighlights(node.right) : null,
    };
  }, []);

  // Search for a value and highlight the path with visual feedback
  const searchInTree = async (value: number) => {
    setIsSearching(true);
    setSearchPath([]);
    setSearchResult("Starting search...");
    setCurrentSearchNode(null);

    let current = root;
    const path: number[] = [];

    while (current) {
      // Highlight current node being examined
      setCurrentSearchNode(current.id);
      path.push(current.id);
      setSearchPath([...path]);

      // Show comparison message
      if (value === current.value) {
        setSearchResult(`🎯 Found ${value} at node ${current.value}!`);
      } else if (value < current.value) {
        setSearchResult(`${value} < ${current.value}, going left...`);
      } else {
        setSearchResult(`${value} > ${current.value}, going right...`);
      }

      // Add delay for visualization
      await new Promise((resolve) =>
        setTimeout(resolve, Math.max(800, 1200 / speed))
      );

      if (value === current.value) {
        setIsSearching(false);
        setCurrentSearchNode(null);
        // Keep the result and path visible - only clear path after delay
        setTimeout(() => {
          setSearchPath([]);
        }, 3000);
        return;
      } else if (value < current.value) {
        current = current.left || null;
      } else {
        current = current.right || null;
      }
    }

    setSearchResult(`❌ ${value} not found in tree`);
    setIsSearching(false);
    setCurrentSearchNode(null);
    // Keep the result visible - only clear path after delay
    setTimeout(() => {
      setSearchPath([]);
    }, 3000);
  };

  const insert = useCallback(() => {
    const value = parseInt(inputValue);
    if (!isNaN(value)) {
      const currentId = nextId;
      setNextId((prev) => prev + 1);
      const newRoot = insertNode(root, value, currentId);
      setRoot(calculatePositions(newRoot));
      setInputValue("");

      // Clear highlights after animation
      setTimeout(() => {
        setRoot((prev) => (prev ? clearHighlights(prev) : null));
      }, 1000 / speed);
    }
  }, [
    inputValue,
    nextId,
    root,
    insertNode,
    calculatePositions,
    speed,
    clearHighlights,
  ]);

  const deleteValue = () => {
    const value = parseInt(inputValue);
    if (!isNaN(value) && root) {
      const newRoot = deleteNode(root, value);
      setRoot(newRoot ? calculatePositions(newRoot) : null);
      setInputValue("");
    }
  };

  const search = () => {
    const value = parseInt(searchValue);
    if (!isNaN(value) && root) {
      // Clear previous search results when starting new search
      setSearchResult("");
      setSearchPath([]);
      searchInTree(value);
    }
  };

  const clearTree = () => {
    setRoot(null);
    setSearchPath([]);
    setSearchResult("");
    setIsSearching(false);
    setCurrentSearchNode(null);
  };

  // Render tree connections with prominent visibility
  const renderConnections = (node: TreeNode | null): React.ReactElement[] => {
    if (!node || (!node.left && !node.right)) return [];

    const connections: React.ReactElement[] = [];
    const nodeRadius = 22;

    if (
      node.left &&
      node.x !== undefined &&
      node.y !== undefined &&
      node.left.x !== undefined &&
      node.left.y !== undefined
    ) {
      const isInSearchPath =
        searchPath.includes(node.id) && searchPath.includes(node.left.id);
      const isCurrentConnection =
        currentSearchNode === node.id || currentSearchNode === node.left.id;

      connections.push(
        <motion.line
          key={`${node.id}-left`}
          x1={node.x}
          y1={node.y + nodeRadius}
          x2={node.left.x}
          y2={node.left.y - nodeRadius}
          stroke={
            isInSearchPath
              ? "#ef4444" // Red for search path
              : isCurrentConnection
              ? "#f59e0b" // Orange for current connection
              : "#64748b" // Slate gray for normal connections
          }
          strokeWidth={isInSearchPath ? "4" : isCurrentConnection ? "3" : "2"}
          opacity="1"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5 }}
        />
      );
      connections.push(...renderConnections(node.left));
    }

    if (
      node.right &&
      node.x !== undefined &&
      node.y !== undefined &&
      node.right.x !== undefined &&
      node.right.y !== undefined
    ) {
      const isInSearchPath =
        searchPath.includes(node.id) && searchPath.includes(node.right.id);
      const isCurrentConnection =
        currentSearchNode === node.id || currentSearchNode === node.right.id;

      connections.push(
        <motion.line
          key={`${node.id}-right`}
          x1={node.x}
          y1={node.y + nodeRadius}
          x2={node.right.x}
          y2={node.right.y - nodeRadius}
          stroke={
            isInSearchPath
              ? "#ef4444" // Red for search path
              : isCurrentConnection
              ? "#f59e0b" // Orange for current connection
              : "#64748b" // Slate gray for normal connections
          }
          strokeWidth={isInSearchPath ? "4" : isCurrentConnection ? "3" : "2"}
          opacity="1"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5 }}
        />
      );
      connections.push(...renderConnections(node.right));
    }

    return connections;
  };

  // Render nodes with search visualization
  const renderNodes = (node: TreeNode | null): React.ReactElement[] => {
    if (!node) return [];

    const nodes: React.ReactElement[] = [];
    const isInSearchPath = searchPath.includes(node.id);
    const isCurrentSearchNode = currentSearchNode === node.id;
    const nodeRadius = 22;

    if (node.x !== undefined && node.y !== undefined) {
      let nodeColor, textColor, strokeColor;

      if (isCurrentSearchNode) {
        // Currently being examined node - Orange
        nodeColor = "#f59e0b";
        textColor = "white";
        strokeColor = "#f59e0b";
      } else if (isInSearchPath) {
        // Visited nodes in search path - Red
        nodeColor = "#ef4444";
        textColor = "white";
        strokeColor = "#ef4444";
      } else if (node.isHighlighted) {
        // Newly inserted nodes - Blue
        nodeColor = "#3b82f6";
        textColor = "white";
        strokeColor = "#3b82f6";
      } else {
        // Default nodes - Light with dark border
        nodeColor = "#f8fafc";
        textColor = "#1e293b";
        strokeColor = "#64748b";
      }

      nodes.push(
        <motion.g
          key={node.id}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: isCurrentSearchNode ? 1.2 : 1,
            opacity: 1,
            transition: { duration: 0.3 / speed, ease: "easeOut" },
          }}
        >
          {/* Pulse effect for current search node */}
          {isCurrentSearchNode && (
            <motion.circle
              cx={node.x}
              cy={node.y}
              r={nodeRadius + 8}
              fill="none"
              stroke="hsl(var(--warning))"
              strokeWidth="2"
              opacity="0.6"
              animate={{
                r: [nodeRadius + 8, nodeRadius + 15, nodeRadius + 8],
                opacity: [0.6, 0.2, 0.6],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}

          {/* Main node circle */}
          <circle
            cx={node.x}
            cy={node.y}
            r={nodeRadius}
            fill={nodeColor}
            stroke={strokeColor}
            strokeWidth="2"
          />

          {/* Node value text */}
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

          {/* Search direction indicator */}
          {isInSearchPath && !isCurrentSearchNode && (
            <motion.circle
              cx={node.x + nodeRadius - 5}
              cy={node.y - nodeRadius + 5}
              r="4"
              fill="white"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            />
          )}
        </motion.g>
      );
    }

    if (node.left) {
      nodes.push(...renderNodes(node.left));
    }

    if (node.right) {
      nodes.push(...renderNodes(node.right));
    }

    return nodes;
  };

  const getTreeHeight = (node: TreeNode | null): number => {
    if (!node) return 0;
    return (
      1 +
      Math.max(
        getTreeHeight(node.left || null),
        getTreeHeight(node.right || null)
      )
    );
  };

  const getNodeCount = (node: TreeNode | null): number => {
    if (!node) return 0;
    return (
      1 + getNodeCount(node.left || null) + getNodeCount(node.right || null)
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 text-foreground">
          Binary Search Tree
        </h2>
        <p className="text-muted-foreground">
          A BST maintains sorted order: left children are smaller, right
          children are larger than parent.
        </p>
      </div>

      <div className="flex gap-6 flex-1">
        {/* Controls */}
        <div className="w-80 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Insert/Delete Value</label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter number..."
                onKeyDown={(e) => e.key === "Enter" && insert()}
              />
              <Button onClick={insert} disabled={!inputValue.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                onClick={deleteValue}
                disabled={!inputValue.trim() || !root}
                variant="outline"
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Search Value</label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search number..."
                onKeyDown={(e) => e.key === "Enter" && search()}
              />
              <Button
                onClick={search}
                disabled={!searchValue.trim() || !root || isSearching}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={clearTree}
              disabled={!root}
              variant="outline"
              className="flex-1"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear
            </Button>
            <Button
              onClick={() => {
                clearTree();
                let currentRoot: TreeNode | null = null;
                let currentNextId = 0;

                [50, 30, 70, 20, 40, 60, 80, 10, 25, 35, 45].forEach(
                  (val, index) => {
                    setTimeout(() => {
                      const newRoot = insertNode(
                        currentRoot,
                        val,
                        currentNextId
                      );
                      currentRoot = newRoot;
                      currentNextId++;
                      setRoot(calculatePositions(newRoot));
                      setNextId(currentNextId);
                    }, index * 300);
                  }
                );
              }}
              variant="outline"
              className="flex-1"
            >
              Demo
            </Button>
          </div>

          {searchResult && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{searchResult}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchResult("");
                    setSearchPath([]);
                    setCurrentSearchNode(null);
                  }}
                  className="h-6 w-6 p-0"
                >
                  ×
                </Button>
              </div>
            </div>
          )}

          {/* Legend */}
          {root && (
            <div className="p-3 bg-muted/50 rounded-lg space-y-2">
              <div className="text-sm font-medium">
                {isSearching || searchPath.length > 0
                  ? "Search Visualization:"
                  : "Node Types:"}
              </div>
              <div className="space-y-1 text-xs">
                {isSearching || searchPath.length > 0 ? (
                  <>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: "#f59e0b" }}
                      ></div>
                      <span>Currently examining</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: "#ef4444" }}
                      ></div>
                      <span>Visited nodes & paths</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: "#3b82f6" }}
                      ></div>
                      <span>Newly inserted</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: "#f8fafc",
                          border: "1px solid #64748b",
                        }}
                      ></div>
                      <span>Normal nodes</span>
                    </div>
                  </>
                )}
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-0.5"
                    style={{ backgroundColor: "#64748b" }}
                  ></div>
                  <span>Tree connections</span>
                </div>
              </div>
            </div>
          )}

          {/* Tree Stats */}
          {root && (
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span>Nodes: {getNodeCount(root)}</span>
                <span>Height: {getTreeHeight(root)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Visualization */}
        <div className="flex-1 relative overflow-hidden">
          {root ? (
            <svg className="w-full h-full bg-background">
              {renderConnections(root)}
              {renderNodes(root)}
            </svg>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <Binary className="h-12 w-12 mx-auto mb-4 opacity-40" />
                <p className="text-base font-medium mb-2">
                  Insert numbers to build your BST
                </p>
                <p className="text-sm opacity-60">
                  Left &lt; Parent &lt; Right
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
