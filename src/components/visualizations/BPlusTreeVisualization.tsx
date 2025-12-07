"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Minus, Search, RotateCcw, Network } from "lucide-react";

interface BPlusTreeVisualizationProps {
  speed: number;
  resetTrigger?: number;
  isPlaying?: boolean;
  onAnimationStateChange?: (isAnimating: boolean) => void;
}

interface BPlusTreeNode {
  id: string;
  keys: number[];
  children: BPlusTreeNode[];
  isLeaf: boolean;
  x: number;
  y: number;
  isHighlighted?: boolean;
  next?: BPlusTreeNode | null; // For leaf-level linked list
  parent?: BPlusTreeNode | null;
}

export default function BPlusTreeVisualization({ speed, resetTrigger, isPlaying = true, onAnimationStateChange }: BPlusTreeVisualizationProps) {
  const [root, setRoot] = useState<BPlusTreeNode | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [order, setOrder] = useState(3);
  const [message, setMessage] = useState("");
  const [searchPath, setSearchPath] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState("");
  const [currentSearchNode, setCurrentSearchNode] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const maxKeys = order - 1;
  const minKeys = Math.ceil(order / 2) - 1;

  const NODE_WIDTH = 40;
  const NODE_HEIGHT = 32;

  const generateId = useCallback(() => {
    return `bplus-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }, []);

  const createNode = useCallback(
    (keys: number[] = [], isLeaf = true): BPlusTreeNode => {
      return {
        id: generateId(),
        keys: [...keys],
        children: [],
        isLeaf,
        x: 0,
        y: 0,
        isHighlighted: false,
        next: null,
        parent: null,
      };
    },
    [generateId]
  );

  const calculatePositions = useCallback(
    (node: BPlusTreeNode | null, x = 0, y = 0): BPlusTreeNode | null => {
      if (!node) return null;

      const newNode = { ...node, x, y };

      if (!node.isLeaf && node.children.length > 0) {
        const spacing = 90;
        const startX = x - ((node.children.length - 1) * spacing) / 2;

        for (let i = 0; i < node.children.length; i++) {
          const child = node.children[i];
          if (child) {
            const childX = startX + i * spacing;
            const positionedChild = calculatePositions(child, childX, y + 70);
            if (positionedChild) {
              newNode.children[i] = positionedChild;
            }
          }
        }
      }

      return newNode;
    },
    []
  );

  // Helper to wait with pause support
  const delay = useCallback((ms: number) => {
    return new Promise<void>((resolve) => {
      const startTime = Date.now();
      const checkPause = () => {
        if (!isPaused) {
          const elapsed = Date.now() - startTime;
          if (elapsed >= ms) {
            resolve();
          } else {
            setTimeout(checkPause, 50);
          }
        } else {
          setTimeout(checkPause, 100);
        }
      };
      checkPause();
    });
  }, [isPaused]);

  const searchInBPlusTree = async (value: number): Promise<void> => {
    if (!root) {
      setSearchResult(`${value} not found - tree is empty`);
      return;
    }

    setIsSearching(true);
    onAnimationStateChange?.(true);
    setSearchPath([]);
    setSearchResult("Starting search...");
    setCurrentSearchNode(null);

    let current = root;
    const path: string[] = [];

    while (current) {
      setCurrentSearchNode(current.id);
      path.push(current.id);
      setSearchPath([...path]);

      let i = 0;
      while (i < current.keys.length && value >= current.keys[i]) {
        i++;
      }

      if (current.isLeaf) {
        setSearchResult(`Searching in leaf node...`);
      } else {
        setSearchResult(`Searching node, going to child ${i}...`);
      }

      await delay(Math.max(800, 1200 / speed));

      if (current.isLeaf) {
        const found = current.keys.includes(value);
        if (found) {
          setSearchResult(`🎯 Found ${value} in leaf!`);
        } else {
          setSearchResult(`❌ ${value} not found in tree`);
        }
        setIsSearching(false);
        onAnimationStateChange?.(false);
        setCurrentSearchNode(null);
        setTimeout(() => {
          setSearchPath([]);
        }, 3000);
        return;
      }

      current = current.children[i];
    }

    setSearchResult(`❌ ${value} not found in tree`);
    setIsSearching(false);
    onAnimationStateChange?.(false);
    setCurrentSearchNode(null);
    setTimeout(() => {
      setSearchPath([]);
    }, 3000);
  };

  const clearHighlights = useCallback((node: BPlusTreeNode): BPlusTreeNode => {
    return {
      ...node,
      isHighlighted: false,
      children: node.children.map((child) =>
        child ? clearHighlights(child) : child
      ),
    };
  }, []);

  const insertIntoBPlusTree = useCallback(
    (
      node: BPlusTreeNode,
      value: number
    ): { node: BPlusTreeNode; promoted?: number; newChild?: BPlusTreeNode } => {
      let i = 0;
      while (i < node.keys.length && value >= node.keys[i]) {
        i++;
      }

      if (node.isLeaf) {
        const newKeys = [...node.keys];
        newKeys.splice(i, 0, value);

        const updatedNode = {
          ...node,
          keys: newKeys,
          isHighlighted: true,
        };

        if (newKeys.length > maxKeys) {
          const midIndex = Math.ceil(newKeys.length / 2);
          const leftKeys = newKeys.slice(0, midIndex);
          const rightKeys = newKeys.slice(midIndex);
          const promotedKey = rightKeys[0];

          const leftNode = createNode(leftKeys, true);
          const rightNode = createNode(rightKeys, true);
          leftNode.next = rightNode;

          if (leftKeys.includes(value)) leftNode.isHighlighted = true;
          if (rightKeys.includes(value)) rightNode.isHighlighted = true;

          return {
            node: leftNode,
            promoted: promotedKey,
            newChild: rightNode,
          };
        }

        return { node: updatedNode };
      } else {
        // Ensure child exists before recursing
        // In B+ tree, internal nodes should have children.length = keys.length + 1
        if (i >= node.children.length || !node.children[i]) {
          console.error('Invalid tree state: child missing at index', i, 'keys:', node.keys, 'children count:', node.children.length);
          return { node };
        }
        
        const childResult = insertIntoBPlusTree(node.children[i], value);
        const newChildren = [...node.children];
        newChildren[i] = childResult.node;

        let updatedNode = {
          ...node,
          children: newChildren,
        };

        if (childResult.promoted !== undefined && childResult.newChild) {
          const newKeys = [...node.keys];
          newKeys.splice(i, 0, childResult.promoted);
          newChildren.splice(i + 1, 0, childResult.newChild);

          updatedNode = {
            ...updatedNode,
            keys: newKeys,
            children: newChildren,
          };

          if (newKeys.length > maxKeys) {
            const midIndex = Math.floor(newKeys.length / 2);
            const leftKeys = newKeys.slice(0, midIndex);
            const rightKeys = newKeys.slice(midIndex + 1); // Skip the promoted key
            const promotedKey = newKeys[midIndex]; // The middle key gets promoted

            const leftChildren = newChildren.slice(0, midIndex + 1);
            const rightChildren = newChildren.slice(midIndex + 1);

            const leftNode = createNode(leftKeys, false);
            leftNode.children = leftChildren;

            const rightNode = createNode(rightKeys, false);
            rightNode.children = rightChildren;

            return {
              node: leftNode,
              promoted: promotedKey,
              newChild: rightNode,
            };
          }
        }

        return { node: updatedNode };
      }
    },
    [createNode, maxKeys]
  );

  const insert = useCallback(() => {
    const value = parseInt(inputValue);
    if (isNaN(value)) return;

    setMessage(`Inserting ${value}`);

    if (!root) {
      const newRoot = createNode([value], true);
      newRoot.isHighlighted = true;
      setRoot(calculatePositions(newRoot));
    } else {
      const result = insertIntoBPlusTree(root, value);

      if (result.promoted !== undefined && result.newChild) {
        const newRoot = createNode([result.promoted], false);
        newRoot.children = [result.node, result.newChild];
        setRoot(calculatePositions(newRoot));
      } else {
        setRoot(calculatePositions(result.node));
      }
    }

    setInputValue("");

    setTimeout(() => {
      setRoot((prev) => (prev ? clearHighlights(prev) : null));
      setMessage("");
    }, 1000);
  }, [
    inputValue,
    root,
    createNode,
    calculatePositions,
    insertIntoBPlusTree,
    clearHighlights,
  ]);

  const deleteValue = () => {
    setMessage("Delete operation not fully implemented");
    setTimeout(() => setMessage(""), 2000);
  };

  const search = () => {
    const value = parseInt(searchValue);
    if (!isNaN(value) && root) {
      setSearchResult("");
      setSearchPath([]);
      searchInBPlusTree(value);
    }
  };

  const clearTree = () => {
    setRoot(null);
    setSearchPath([]);
    setSearchResult("");
    setMessage("");
    setCurrentSearchNode(null);
  };

  const changeOrder = (newOrder: string) => {
    const ord = parseInt(newOrder);
    setOrder(ord);
    clearTree();
  };

  // Sync pause state with parent's isPlaying (only when searching)
  useEffect(() => {
    if (isSearching) {
      setIsPaused(!isPlaying);
    }
  }, [isPlaying, isSearching]);

  // Handle reset trigger from parent
  useEffect(() => {
    if (resetTrigger !== undefined && resetTrigger > 0) {
      setIsSearching(false);
      setIsPaused(false);
      onAnimationStateChange?.(false);
      clearTree();
    }
  }, [resetTrigger]);

  const renderBPlusTreeNode = (node: BPlusTreeNode): React.ReactElement => {
    const isInSearchPath = searchPath.includes(node.id);
    const isCurrentSearchNode = currentSearchNode === node.id;
    const nodeWidth = Math.max(node.keys.length * NODE_WIDTH, NODE_WIDTH * 2);

    let nodeColor, textClass, strokeColor;

    if (isCurrentSearchNode) {
      nodeColor = "#f59e0b";
      textClass = "fill-white";
      strokeColor = "#f59e0b";
    } else if (isInSearchPath) {
      nodeColor = "#ef4444";
      textClass = "fill-white";
      strokeColor = "#ef4444";
    } else if (node.isHighlighted) {
      nodeColor = "#3b82f6";
      textClass = "fill-white";
      strokeColor = "#3b82f6";
    } else if (node.isLeaf) {
      nodeColor = "#dbeafe";
      textClass = "fill-sky-900";
      strokeColor = "#0ea5e9";
    } else {
      nodeColor = "hsl(var(--muted))";
      textClass = "fill-foreground";
      strokeColor = "hsl(var(--border))";
    }

    return (
      <motion.g
        key={`node-${node.id}`}
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: isCurrentSearchNode ? 1.1 : 1,
          opacity: 1,
          transition: { duration: 0.3 / speed, ease: "easeOut" },
        }}
      >
        {isCurrentSearchNode && (
          <motion.rect
            x={node.x - nodeWidth / 2 - 4}
            y={node.y - NODE_HEIGHT / 2 - 4}
            width={nodeWidth + 8}
            height={NODE_HEIGHT + 8}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2"
            rx="6"
            opacity="0.6"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.6, 0.2, 0.6],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}

        <rect
          x={node.x - nodeWidth / 2}
          y={node.y - NODE_HEIGHT / 2}
          width={nodeWidth}
          height={NODE_HEIGHT}
          fill={nodeColor}
          stroke={strokeColor}
          strokeWidth="2"
          rx="4"
        />

        {node.keys.map((key, index) => (
          <g key={`${node.id}-key-${index}`}>
            {index > 0 && (
              <line
                x1={node.x - nodeWidth / 2 + index * NODE_WIDTH}
                y1={node.y - NODE_HEIGHT / 2}
                x2={node.x - nodeWidth / 2 + index * NODE_WIDTH}
                y2={node.y + NODE_HEIGHT / 2}
                stroke={strokeColor}
                strokeWidth="1"
                opacity="0.3"
              />
            )}

            <text
              x={node.x - nodeWidth / 2 + index * NODE_WIDTH + NODE_WIDTH / 2}
              y={node.y + 5}
              textAnchor="middle"
              className={`text-sm font-semibold select-none ${textClass}`}
            >
              {key}
            </text>
          </g>
        ))}
      </motion.g>
    );
  };

  const renderConnections = (node: BPlusTreeNode): React.ReactElement[] => {
    const connections: React.ReactElement[] = [];

    if (!node.isLeaf) {
      node.children.forEach((child, index) => {
        if (child) {
          const isInSearchPath =
            searchPath.includes(node.id) && searchPath.includes(child.id);
          const isCurrentConnection =
            currentSearchNode === node.id || currentSearchNode === child.id;

          connections.push(
            <motion.line
              key={`connection-${node.id}-${child.id}-${index}`}
              x1={node.x}
              y1={node.y + NODE_HEIGHT / 2}
              x2={child.x}
              y2={child.y - NODE_HEIGHT / 2}
              stroke={
                isInSearchPath
                  ? "#ef4444"
                  : isCurrentConnection
                  ? "#f59e0b"
                  : "#64748b"
              }
              strokeWidth={
                isInSearchPath ? "4" : isCurrentConnection ? "3" : "2"
              }
              opacity="1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5 }}
            />
          );
          connections.push(...renderConnections(child));
        }
      });
    }

    return connections;
  };

  const renderLeafLinks = (node: BPlusTreeNode): React.ReactElement[] => {
    const links: React.ReactElement[] = [];

    if (node.isLeaf && node.next) {
      links.push(
        <motion.line
          key={`leaf-link-${node.id}`}
          x1={node.x + (node.keys.length * NODE_WIDTH) / 2}
          y1={node.y}
          x2={node.next.x - (node.next.keys.length * NODE_WIDTH) / 2}
          y2={node.next.y}
          stroke="#0ea5e9"
          strokeWidth="2"
          strokeDasharray="4 2"
          markerEnd="url(#arrowhead)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5 }}
        />
      );
    }

    if (!node.isLeaf) {
      node.children.forEach((child) => {
        if (child) {
          links.push(...renderLeafLinks(child));
        }
      });
    }

    return links;
  };

  const renderAllNodes = (node: BPlusTreeNode): React.ReactElement[] => {
    const nodes: React.ReactElement[] = [renderBPlusTreeNode(node)];

    if (!node.isLeaf) {
      node.children.forEach((child) => {
        if (child) {
          nodes.push(...renderAllNodes(child));
        }
      });
    }

    return nodes;
  };

  const getTreeHeight = (node: BPlusTreeNode | null): number => {
    if (!node) return 0;
    if (node.isLeaf || node.children.length === 0) return 1;

    const childHeights = node.children
      .filter((child) => child !== null)
      .map((child) => getTreeHeight(child));

    return childHeights.length > 0 ? 1 + Math.max(...childHeights) : 1;
  };

  const getNodeCount = (node: BPlusTreeNode | null): number => {
    if (!node) return 0;
    return (
      1 +
      node.children
        .filter((child) => child !== null)
        .reduce((sum, child) => sum + getNodeCount(child), 0)
    );
  };

  return (
    <div className="h-full flex flex-col p-2 sm:p-0">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-2 text-foreground">
          B+ Tree
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          All data is stored in leaf nodes, which are linked for efficient range queries.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 flex-1">
        <div className="w-full lg:w-80 space-y-3 lg:space-y-4 order-2 lg:order-1 max-h-[50vh] lg:max-h-none overflow-y-auto lg:overflow-visible">
          <div className="space-y-2">
            <label className="text-sm font-medium">Order (m)</label>
            <select
              value={order}
              onChange={(e) => changeOrder(e.target.value)}
              className="w-full p-2 border rounded-md bg-background"
            >
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </div>

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
                const demoValues = [10, 20, 5, 15, 25, 30, 35];

                demoValues.forEach((val, index) => {
                  setTimeout(() => {
                    setInputValue(val.toString());
                    setTimeout(() => {
                      const value = val;
                      setMessage(`Inserting ${value}`);

                      setRoot((currentRoot) => {
                        if (!currentRoot) {
                          const newRoot = createNode([value], true);
                          newRoot.isHighlighted = true;
                          return calculatePositions(newRoot);
                        } else {
                          const result = insertIntoBPlusTree(currentRoot, value);

                          if (
                            result.promoted !== undefined &&
                            result.newChild
                          ) {
                            const newRoot = createNode(
                              [result.promoted],
                              false
                            );
                            newRoot.children = [result.node, result.newChild];
                            return calculatePositions(newRoot);
                          } else {
                            return calculatePositions(result.node);
                          }
                        }
                      });

                      setInputValue("");

                      setTimeout(() => {
                        setRoot((prev) =>
                          prev ? clearHighlights(prev) : null
                        );
                        setMessage("");
                      }, 800);
                    }, 100);
                  }, index * 1200);
                });
              }}
              variant="outline"
              className="flex-1"
            >
              Demo
            </Button>
          </div>

          {message && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                {message}
              </p>
            </div>
          )}

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
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: "#f59e0b" }}
                      ></div>
                      <span>Currently examining</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: "#ef4444" }}
                      ></div>
                      <span>Visited nodes</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: "#3b82f6" }}
                      ></div>
                      <span>Newly inserted</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: "#e0f2fe", border: "1px solid #0ea5e9" }}
                      ></div>
                      <span>Leaf nodes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-0.5"
                        style={{ backgroundColor: "#0ea5e9", borderTop: "2px dashed #0ea5e9" }}
                      ></div>
                      <span>Leaf links</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {root && (
            <div className="pt-4 border-t">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span>Nodes: {getNodeCount(root)}</span>
                <span>Height: {getTreeHeight(root)}</span>
                <span>Max Keys: {maxKeys}</span>
                <span>Min Keys: {minKeys}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 relative min-h-[300px] lg:min-h-[400px] order-1 lg:order-2 bg-background rounded-lg border overflow-hidden">
          {root ? (
            <div className="w-full h-full flex items-center justify-center p-4">
              <svg
                className="w-full h-full max-w-full max-h-full"
                viewBox="-300 -40 600 320"
                preserveAspectRatio="xMidYMid meet"
                style={{ minHeight: "250px" }}
              >
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="10"
                    refX="9"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3, 0 6" fill="#0ea5e9" />
                  </marker>
                </defs>
                <g>
                  {renderConnections(root)}
                  {renderLeafLinks(root)}
                  {renderAllNodes(root)}
                </g>
              </svg>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <Network className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4 opacity-40" />
                <p className="text-sm sm:text-base font-medium mb-2">
                  Insert numbers to build your B+ Tree
                </p>
                <p className="text-xs sm:text-sm opacity-60">
                  Order {order}: Data in leaves, linked for range queries
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
