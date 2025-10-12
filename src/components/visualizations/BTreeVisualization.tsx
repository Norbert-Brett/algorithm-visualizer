"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Minus, Search, RotateCcw, Network } from "lucide-react";

interface BTreeVisualizationProps {
  speed: number;
}

// Simplified B-Tree node structure
interface BTreeNode {
  id: string; // Use string for guaranteed uniqueness
  keys: number[];
  children: BTreeNode[];
  isLeaf: boolean;
  x: number;
  y: number;
  isHighlighted?: boolean;
  numKeys: number;
  parent?: BTreeNode | null;
}

export default function BTreeVisualization({ speed }: BTreeVisualizationProps) {
  const [root, setRoot] = useState<BTreeNode | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [maxDegree, setMaxDegree] = useState(3);
  const [message, setMessage] = useState("");
  const [searchPath, setSearchPath] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState("");
  const [currentSearchNode, setCurrentSearchNode] = useState<string | null>(
    null
  );
  const [preemptiveSplit, setPreemptiveSplit] = useState(false);

  // B-Tree parameters
  const maxKeys = maxDegree - 1;
  const minKeys = Math.ceil(maxDegree / 2) - 1;

  // Constants for visualization
  const NODE_WIDTH = 40;
  const NODE_HEIGHT = 32;

  // Generate truly unique ID
  const generateId = useCallback(() => {
    return `btree-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }, []);

  const createNode = useCallback(
    (keys: number[] = [], isLeaf = true): BTreeNode => {
      return {
        id: generateId(),
        keys: [...keys],
        children: [],
        isLeaf,
        x: 0,
        y: 0,
        isHighlighted: false,
        numKeys: keys.length,
        parent: null,
      };
    },
    [generateId]
  );

  // Simple position calculation
  const calculatePositions = useCallback(
    (node: BTreeNode | null, x = 0, y = 0): BTreeNode | null => {
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

  // Search in B-Tree with enhanced visualization
  const searchInBTree = async (value: number): Promise<void> => {
    if (!root) {
      setSearchResult(`${value} not found - tree is empty`);
      return;
    }

    setIsSearching(true);
    setSearchPath([]);
    setSearchResult("Starting search...");
    setCurrentSearchNode(null);

    let current = root;
    const path: string[] = [];

    while (current) {
      // Highlight current node being examined
      setCurrentSearchNode(current.id);
      path.push(current.id);
      setSearchPath([...path]);

      // Show comparison message
      let i = 0;
      while (i < current.numKeys && value > current.keys[i]) {
        i++;
      }

      if (i < current.numKeys && value === current.keys[i]) {
        setSearchResult(`🎯 Found ${value} in node!`);
      } else if (current.isLeaf) {
        setSearchResult(`Searching in leaf node...`);
      } else {
        setSearchResult(`Searching node, going to child ${i}...`);
      }

      // Add delay for visualization
      await new Promise((resolve) =>
        setTimeout(resolve, Math.max(800, 1200 / speed))
      );

      if (i < current.numKeys && value === current.keys[i]) {
        setIsSearching(false);
        setCurrentSearchNode(null);
        // Keep the result and path visible - only clear path after delay
        setTimeout(() => {
          setSearchPath([]);
        }, 3000);
        return;
      }

      if (current.isLeaf) {
        setSearchResult(`❌ ${value} not found in tree`);
        setIsSearching(false);
        setCurrentSearchNode(null);
        // Keep the result visible - only clear path after delay
        setTimeout(() => {
          setSearchPath([]);
        }, 3000);
        return;
      }

      current = current.children[i];
    }

    setSearchResult(`❌ ${value} not found in tree`);
    setIsSearching(false);
    setCurrentSearchNode(null);
    setTimeout(() => {
      setSearchPath([]);
    }, 3000);
  };

  // Delete from B-Tree (simplified version)
  const deleteFromBTree = (
    node: BTreeNode | null,
    value: number
  ): BTreeNode | null => {
    if (!node) return null;

    let i = 0;
    while (i < node.keys.length && value > node.keys[i]) {
      i++;
    }

    if (i < node.keys.length && value === node.keys[i]) {
      // Key found
      if (node.isLeaf) {
        // Remove from leaf
        const newKeys = [...node.keys];
        newKeys.splice(i, 1);
        return {
          ...node,
          keys: newKeys,
          numKeys: newKeys.length,
        };
      } else {
        // Replace with predecessor and delete predecessor
        const predecessor = getPredecessor(node, i);
        const newKeys = [...node.keys];
        newKeys[i] = predecessor;
        const deletedChild = deleteFromBTree(node.children[i], predecessor);
        const newChildren = [...node.children];
        if (deletedChild) newChildren[i] = deletedChild;
        return {
          ...node,
          keys: newKeys,
          children: newChildren,
        };
      }
    } else if (!node.isLeaf) {
      // Recurse to child
      const deletedChild = deleteFromBTree(node.children[i], value);
      const newChildren = [...node.children];
      if (deletedChild) newChildren[i] = deletedChild;
      return {
        ...node,
        children: newChildren,
      };
    }

    return node;
  };

  // Get predecessor key
  const getPredecessor = (node: BTreeNode, index: number): number => {
    let current = node.children[index];
    while (!current.isLeaf) {
      current = current.children[current.keys.length];
    }
    return current.keys[current.keys.length - 1];
  };

  // Clear highlights helper
  const clearHighlights = useCallback((node: BTreeNode): BTreeNode => {
    return {
      ...node,
      isHighlighted: false,
      children: node.children.map((child) =>
        child ? clearHighlights(child) : child
      ),
    };
  }, []);

  // Proper B-Tree insert operation
  const insertIntoBTree = useCallback(
    (
      node: BTreeNode,
      value: number
    ): { node: BTreeNode; promoted?: number; newChild?: BTreeNode } => {
      // Find the position to insert
      let i = 0;
      while (i < node.keys.length && value > node.keys[i]) {
        i++;
      }

      // Check if value already exists
      if (i < node.keys.length && value === node.keys[i]) {
        return { node }; // Value already exists, no change
      }

      if (node.isLeaf) {
        // Insert into leaf node
        const newKeys = [...node.keys];
        newKeys.splice(i, 0, value);

        const updatedNode = {
          ...node,
          keys: newKeys,
          numKeys: newKeys.length,
          isHighlighted: true,
        };

        // Check if node needs to be split
        if (newKeys.length > maxKeys) {
          const midIndex = Math.floor(newKeys.length / 2);
          const leftKeys = newKeys.slice(0, midIndex);
          const rightKeys = newKeys.slice(midIndex + 1);
          const promotedKey = newKeys[midIndex];

          const leftNode = createNode(leftKeys, true);
          const rightNode = createNode(rightKeys, true);

          // Highlight the nodes containing the new value
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
        // Insert into internal node - recurse to child
        const childResult = insertIntoBTree(node.children[i], value);
        const newChildren = [...node.children];
        newChildren[i] = childResult.node;

        let updatedNode = {
          ...node,
          children: newChildren,
        };

        // Handle promotion from child
        if (childResult.promoted !== undefined && childResult.newChild) {
          const newKeys = [...node.keys];
          newKeys.splice(i, 0, childResult.promoted);
          newChildren.splice(i + 1, 0, childResult.newChild);

          updatedNode = {
            ...updatedNode,
            keys: newKeys,
            numKeys: newKeys.length,
            children: newChildren,
          };

          // Check if this node needs to be split
          if (newKeys.length > maxKeys) {
            const midIndex = Math.floor(newKeys.length / 2);
            const leftKeys = newKeys.slice(0, midIndex);
            const rightKeys = newKeys.slice(midIndex + 1);
            const promotedKey = newKeys[midIndex];

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
      // Create first node with the value
      const newRoot = createNode([value], true);
      newRoot.isHighlighted = true;
      setRoot(calculatePositions(newRoot));
    } else {
      const result = insertIntoBTree(root, value);

      if (result.promoted !== undefined && result.newChild) {
        // Root was split, create new root
        const newRoot = createNode([result.promoted], false);
        newRoot.children = [result.node, result.newChild];
        setRoot(calculatePositions(newRoot));
      } else {
        // No root split needed
        setRoot(calculatePositions(result.node));
      }
    }

    setInputValue("");

    // Clear highlights after animation
    setTimeout(() => {
      setRoot((prev) => (prev ? clearHighlights(prev) : null));
      setMessage("");
    }, 1000);
  }, [
    inputValue,
    root,
    createNode,
    calculatePositions,
    insertIntoBTree,
    clearHighlights,
  ]);

  const deleteValue = () => {
    const value = parseInt(inputValue);
    if (isNaN(value) || !root) return;

    setMessage(`Deleting ${value}`);
    const newRoot = deleteFromBTree(root, value);

    if (newRoot && newRoot.numKeys === 0 && !newRoot.isLeaf) {
      setRoot(calculatePositions(newRoot.children[0]));
    } else {
      setRoot(newRoot ? calculatePositions(newRoot) : null);
    }

    setInputValue("");
    setTimeout(() => setMessage(""), 2000);
  };

  const search = () => {
    const value = parseInt(searchValue);
    if (!isNaN(value) && root) {
      // Clear previous search results when starting new search
      setSearchResult("");
      setSearchPath([]);
      searchInBTree(value);
    }
  };

  const clearTree = () => {
    setRoot(null);
    setSearchPath([]);
    setSearchResult("");
    setMessage("");
    setCurrentSearchNode(null);
  };

  const changeDegree = (newDegree: string) => {
    const degree = parseInt(newDegree);
    setMaxDegree(degree);
    clearTree(); // Clear tree when changing degree
  };

  // Render B-Tree node with enhanced visualization
  const renderBTreeNode = (node: BTreeNode): React.ReactElement => {
    const isInSearchPath = searchPath.includes(node.id);
    const isCurrentSearchNode = currentSearchNode === node.id;
    const nodeWidth = Math.max(node.keys.length * NODE_WIDTH, NODE_WIDTH * 2);

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
        {/* Pulse effect for current search node */}
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

        {/* Node background */}
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

        {/* Keys */}
        {node.keys.map((key, index) => (
          <g key={`${node.id}-key-${index}`}>
            {/* Key separator */}
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

            {/* Key text */}
            <text
              x={node.x - nodeWidth / 2 + index * NODE_WIDTH + NODE_WIDTH / 2}
              y={node.y + 5}
              textAnchor="middle"
              className="text-sm font-semibold select-none"
              fill={textColor}
            >
              {key}
            </text>
          </g>
        ))}
      </motion.g>
    );
  };

  // Render connections between nodes with search highlighting
  const renderConnections = (node: BTreeNode): React.ReactElement[] => {
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
                  ? "#ef4444" // Red for search path
                  : isCurrentConnection
                  ? "#f59e0b" // Orange for current connection
                  : "#64748b" // Slate gray for normal connections
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

  // Render all nodes
  const renderAllNodes = (node: BTreeNode): React.ReactElement[] => {
    const nodes: React.ReactElement[] = [renderBTreeNode(node)];

    if (!node.isLeaf) {
      node.children.forEach((child) => {
        if (child) {
          nodes.push(...renderAllNodes(child));
        }
      });
    }

    return nodes;
  };

  const getTreeHeight = (node: BTreeNode | null): number => {
    if (!node) return 0;
    if (node.isLeaf || node.children.length === 0) return 1;

    const childHeights = node.children
      .filter((child) => child !== null)
      .map((child) => getTreeHeight(child));

    return childHeights.length > 0 ? 1 + Math.max(...childHeights) : 1;
  };

  const getNodeCount = (node: BTreeNode | null): number => {
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
          B-Tree
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          A self-balancing tree where nodes can contain multiple keys. Used in
          databases and file systems.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 flex-1">
        {/* Controls */}
        <div className="w-full lg:w-80 space-y-3 lg:space-y-4 order-2 lg:order-1 max-h-[50vh] lg:max-h-none overflow-y-auto lg:overflow-visible">
          {/* Degree Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Maximum Degree</label>
            <select
              value={maxDegree}
              onChange={(e) => changeDegree(e.target.value)}
              className="w-full p-2 border rounded-md bg-background"
            >
              <option value="3">3 (2-3 Tree)</option>
              <option value="4">4 (2-3-4 Tree)</option>
              <option value="5">5</option>
            </select>
          </div>

          {/* Preemptive Split Option */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="preemptive"
              checked={preemptiveSplit}
              onChange={(e) => setPreemptiveSplit(e.target.checked)}
              disabled={maxDegree % 2 !== 0}
              className="rounded"
            />
            <label htmlFor="preemptive" className="text-sm">
              Preemptive Split (Even degrees only)
            </label>
          </div>

          {/* Insert/Delete */}
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

          {/* Search */}
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
                const demoValues = [10, 20, 5, 15, 25];

                demoValues.forEach((val, index) => {
                  setTimeout(() => {
                    setInputValue(val.toString());
                    setTimeout(() => {
                      // Trigger the insert function
                      const value = val;
                      setMessage(`Inserting ${value}`);

                      setRoot((currentRoot) => {
                        if (!currentRoot) {
                          const newRoot = createNode([value], true);
                          newRoot.isHighlighted = true;
                          return calculatePositions(newRoot);
                        } else {
                          const result = insertIntoBTree(currentRoot, value);

                          if (
                            result.promoted !== undefined &&
                            result.newChild
                          ) {
                            // Root was split, create new root
                            const newRoot = createNode(
                              [result.promoted],
                              false
                            );
                            newRoot.children = [result.node, result.newChild];
                            return calculatePositions(newRoot);
                          } else {
                            // No root split needed
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

          {/* Messages */}
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
                      <span>Visited nodes & paths</span>
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
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span>Nodes: {getNodeCount(root)}</span>
                <span>Height: {getTreeHeight(root)}</span>
                <span>Max Keys: {maxKeys}</span>
                <span>Min Keys: {minKeys}</span>
              </div>
            </div>
          )}
        </div>

        {/* Visualization */}
        <div className="flex-1 relative min-h-[300px] lg:min-h-[400px] order-1 lg:order-2 bg-background rounded-lg border overflow-hidden">
          {root ? (
            <div className="w-full h-full flex items-center justify-center p-4">
              <svg
                className="w-full h-full max-w-full max-h-full"
                viewBox="-300 -40 600 320"
                preserveAspectRatio="xMidYMid meet"
                style={{ minHeight: "250px" }}
              >
                <g>
                  {renderConnections(root)}
                  {renderAllNodes(root)}
                </g>
              </svg>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <Network className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4 opacity-40" />
                <p className="text-sm sm:text-base font-medium mb-2">
                  Insert numbers to build your B-Tree
                </p>
                <p className="text-xs sm:text-sm opacity-60">
                  Degree {maxDegree}: {minKeys}-{maxKeys} keys per node
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
