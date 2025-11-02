"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, RotateCcw, Binary } from "lucide-react";

interface RedBlackTreeVisualizationProps {
  speed: number;
}

enum Color {
  RED = "RED",
  BLACK = "BLACK",
}

interface RBNode {
  id: number;
  value: number;
  color: Color;
  left: RBNode | null;
  right: RBNode | null;
  parent: RBNode | null;
  x?: number;
  y?: number;
  isHighlighted?: boolean;
  isRecolored?: boolean;
}

export default function RedBlackTreeVisualization({ speed }: RedBlackTreeVisualizationProps) {
  const [root, setRoot] = useState<RBNode | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [nextId, setNextId] = useState(0);
  const [operationInfo, setOperationInfo] = useState<string>("");

  // Create a new node
  const createNode = (value: number, currentId: number, color: Color = Color.RED): RBNode => ({
    id: currentId,
    value,
    color,
    left: null,
    right: null,
    parent: null,
    isHighlighted: true,
    x: 0,
    y: 0,
  });

  // Calculate positions for tree nodes
  const calculatePositions = useCallback(
    (node: RBNode | null, x = 0, y = 0, level = 0): RBNode | null => {
      if (!node) return null;

      const baseSpacing = 100;
      const spacing = Math.max(50, baseSpacing / Math.pow(1.3, level));
      const verticalSpacing = 70;

      const newNode = { ...node, x, y };

      if (node.left) {
        newNode.left = calculatePositions(
          node.left,
          x - spacing,
          y + verticalSpacing,
          level + 1
        );
        if (newNode.left) {
          newNode.left.parent = newNode;
        }
      }

      if (node.right) {
        newNode.right = calculatePositions(
          node.right,
          x + spacing,
          y + verticalSpacing,
          level + 1
        );
        if (newNode.right) {
          newNode.right.parent = newNode;
        }
      }

      return newNode;
    },
    []
  );

  // Left rotate
  const rotateLeft = useCallback((x: RBNode, rootRef: { current: RBNode | null }): void => {
    const y = x.right!;
    x.right = y.left;
    
    if (y.left) {
      y.left.parent = x;
    }
    
    y.parent = x.parent;
    
    if (!x.parent) {
      rootRef.current = y;
    } else if (x === x.parent.left) {
      x.parent.left = y;
    } else {
      x.parent.right = y;
    }
    
    y.left = x;
    x.parent = y;

    setOperationInfo("Left rotation performed");
    setTimeout(() => setOperationInfo(""), 2000);
  }, []);

  // Right rotate
  const rotateRight = useCallback((y: RBNode, rootRef: { current: RBNode | null }): void => {
    const x = y.left!;
    y.left = x.right;
    
    if (x.right) {
      x.right.parent = y;
    }
    
    x.parent = y.parent;
    
    if (!y.parent) {
      rootRef.current = x;
    } else if (y === y.parent.left) {
      y.parent.left = x;
    } else {
      y.parent.right = x;
    }
    
    x.right = y;
    y.parent = x;

    setOperationInfo("Right rotation performed");
    setTimeout(() => setOperationInfo(""), 2000);
  }, []);

  // Fix Red-Black tree violations after insertion
  const fixInsert = useCallback((k: RBNode, rootRef: { current: RBNode | null }): void => {
    let current = k;
    
    while (current.parent && current.parent.color === Color.RED) {
      if (current.parent === current.parent.parent?.left) {
        const u = current.parent.parent.right; // Uncle
        
        if (u && u.color === Color.RED) {
          // Case 1: Uncle is red - recolor
          u.color = Color.BLACK;
          current.parent.color = Color.BLACK;
          current.parent.parent.color = Color.RED;
          current.parent.parent.isRecolored = true;
          current = current.parent.parent;
          setOperationInfo("Recoloring: Uncle is red");
        } else {
          if (current === current.parent.right) {
            // Case 2: current is right child - left rotate
            current = current.parent;
            rotateLeft(current, rootRef);
          }
          // Case 3: current is left child - recolor and right rotate
          if (current.parent) {
            current.parent.color = Color.BLACK;
            if (current.parent.parent) {
              current.parent.parent.color = Color.RED;
              rotateRight(current.parent.parent, rootRef);
            }
          }
          break; // Exit after rotation and recoloring
        }
      } else {
        const u = current.parent.parent?.left; // Uncle
        
        if (u && u.color === Color.RED) {
          // Case 1: Uncle is red - recolor
          u.color = Color.BLACK;
          current.parent.color = Color.BLACK;
          current.parent.parent!.color = Color.RED;
          current.parent.parent!.isRecolored = true;
          current = current.parent.parent!;
          setOperationInfo("Recoloring: Uncle is red");
        } else {
          if (current === current.parent.left) {
            // Case 2: current is left child - right rotate
            current = current.parent;
            rotateRight(current, rootRef);
          }
          // Case 3: current is right child - recolor and left rotate
          if (current.parent) {
            current.parent.color = Color.BLACK;
            if (current.parent.parent) {
              current.parent.parent.color = Color.RED;
              rotateLeft(current.parent.parent, rootRef);
            }
          }
          break; // Exit after rotation and recoloring
        }
      }
      
      // Safety check to prevent infinite loops
      if (!current.parent) break;
    }
    
    if (rootRef.current) {
      rootRef.current.color = Color.BLACK; // Root is always black
    }
  }, [rotateLeft, rotateRight]);

  // Insert a value into the Red-Black tree
  const insertRB = useCallback((value: number): RBNode | null => {
    // Check if value already exists
    const findNode = (node: RBNode | null, val: number): boolean => {
      if (!node) return false;
      if (val === node.value) return true;
      if (val < node.value) return findNode(node.left, val);
      return findNode(node.right, val);
    };
    
    if (root && findNode(root, value)) {
      return root; // Value already exists
    }
    
    // Create new node
    const newNode = createNode(value, nextId);
    setNextId(prev => prev + 1);
    
    if (!root) {
      newNode.color = Color.BLACK; // Root is always black
      newNode.isHighlighted = true;
      return newNode;
    }
    
    // Deep clone the tree to avoid mutation issues
    const cloneTree = (node: RBNode | null): RBNode | null => {
      if (!node) return null;
      return {
        ...node,
        left: cloneTree(node.left),
        right: cloneTree(node.right),
        parent: null, // Will be set later
      };
    };
    
    const currentRoot = cloneTree(root);
    
    // Rebuild parent references
    const setParentRefs = (node: RBNode | null, parent: RBNode | null = null): void => {
      if (!node) return;
      node.parent = parent;
      setParentRefs(node.left, node);
      setParentRefs(node.right, node);
    };
    
    setParentRefs(currentRoot);
    
    // Find insertion point
    let current = currentRoot;
    let parent: RBNode | null = null;
    
    while (current) {
      parent = current;
      if (value < current.value) {
        current = current.left;
      } else {
        current = current.right;
      }
    }
    
    // Insert new node
    newNode.parent = parent;
    if (value < parent!.value) {
      parent!.left = newNode;
    } else {
      parent!.right = newNode;
    }
    
    // Fix Red-Black tree violations
    const rootRef = { current: currentRoot };
    fixInsert(newNode, rootRef);
    
    return rootRef.current;
  }, [root, nextId, fixInsert]);

  // Clear highlights helper
  const clearHighlights = useCallback((node: RBNode): RBNode => {
    return {
      ...node,
      isHighlighted: false,
      isRecolored: false,
      left: node.left ? clearHighlights(node.left) : null,
      right: node.right ? clearHighlights(node.right) : null,
    };
  }, []);

  const insert = useCallback(() => {
    const value = parseInt(inputValue);
    if (!isNaN(value)) {
      const newRoot = insertRB(value);
      
      if (newRoot) {
        const positionedRoot = calculatePositions(newRoot);
        setRoot(positionedRoot);
      }
      setInputValue("");

      // Clear highlights after animation
      setTimeout(() => {
        setRoot((prev) => (prev ? clearHighlights(prev) : null));
      }, 1500 / speed);
    }
  }, [inputValue, insertRB, calculatePositions, speed, clearHighlights]);

  const clearTree = () => {
    setRoot(null);
    setOperationInfo("");
    setNextId(0);
  };

  // Render tree connections
  const renderConnections = (node: RBNode | null): React.ReactElement[] => {
    if (!node || (!node.left && !node.right)) return [];

    const connections: React.ReactElement[] = [];
    const nodeRadius = 20;

    if (
      node.left &&
      node.x !== undefined &&
      node.y !== undefined &&
      node.left.x !== undefined &&
      node.left.y !== undefined
    ) {
      connections.push(
        <motion.line
          key={`conn-${node.id}-left-${node.left.id}`}
          x1={node.x}
          y1={node.y + nodeRadius}
          x2={node.left.x}
          y2={node.left.y - nodeRadius}
          stroke="#64748b"
          strokeWidth="2"
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
      connections.push(
        <motion.line
          key={`conn-${node.id}-right-${node.right.id}`}
          x1={node.x}
          y1={node.y + nodeRadius}
          x2={node.right.x}
          y2={node.right.y - nodeRadius}
          stroke="#64748b"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5 }}
        />
      );
      connections.push(...renderConnections(node.right));
    }

    return connections;
  };

  // Render nodes with colors
  const renderNodes = (node: RBNode | null): React.ReactElement[] => {
    if (!node) return [];

    const nodes: React.ReactElement[] = [];
    const nodeRadius = 20;

    if (node.x !== undefined && node.y !== undefined) {
      let nodeColor, textColor, strokeColor;

      if (node.isRecolored) {
        nodeColor = node.color === Color.RED ? "#ef4444" : "#1f2937";
        textColor = "white";
        strokeColor = "#10b981"; // Green border for recolored
      } else if (node.isHighlighted) {
        nodeColor = node.color === Color.RED ? "#ef4444" : "#1f2937";
        textColor = "white";
        strokeColor = "#3b82f6"; // Blue border for newly inserted
      } else {
        nodeColor = node.color === Color.RED ? "#ef4444" : "#1f2937";
        textColor = "white";
        strokeColor = node.color === Color.RED ? "#dc2626" : "#374151";
      }

      nodes.push(
        <motion.g
          key={`node-${node.id}`}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 / speed, ease: "easeOut" }}
        >
          {/* Highlight ring for special states */}
          {(node.isHighlighted || node.isRecolored) && (
            <motion.circle
              cx={node.x}
              cy={node.y}
              r={nodeRadius + 4}
              fill="none"
              stroke={node.isRecolored ? "#10b981" : "#3b82f6"}
              strokeWidth="3"
              opacity="0.7"
              animate={{
                r: [nodeRadius + 4, nodeRadius + 8, nodeRadius + 4],
                opacity: [0.7, 0.3, 0.7],
              }}
              transition={{
                duration: 1,
                repeat: node.isHighlighted || node.isRecolored ? 3 : 0,
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

          {/* Node value */}
          <text
            x={node.x}
            y={node.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="font-semibold select-none"
            fill={textColor}
            fontSize="12"
          >
            {node.value}
          </text>

          {/* Color indicator text */}
          <text
            x={node.x}
            y={node.y + nodeRadius + 15}
            textAnchor="middle"
            dominantBaseline="middle"
            className="font-mono select-none text-xs"
            fill={node.color === Color.RED ? "#ef4444" : "#1f2937"}
            fontSize="10"
          >
            {node.color === Color.RED ? "R" : "B"}
          </text>
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

  const getTreeHeight = (node: RBNode | null): number => {
    if (!node) return 0;
    return 1 + Math.max(getTreeHeight(node.left ?? null), getTreeHeight(node.right ?? null));
  };

  const getNodeCount = (node: RBNode | null): number => {
    if (!node) return 0;
    return 1 + getNodeCount(node.left ?? null) + getNodeCount(node.right ?? null);
  };

  const getBlackHeight = (node: RBNode | null): number => {
    if (!node) return 1; // NIL nodes are black
    const leftHeight = getBlackHeight(node.left ?? null);
    return leftHeight + (node.color === Color.BLACK ? 1 : 0);
  };

  // Validate Red-Black tree properties
  const validateRBTree = (node: RBNode | null): { valid: boolean; message: string } => {
    if (!node) return { valid: true, message: "Valid" };
    
    // Check if red node has red children
    if (node.color === Color.RED) {
      if ((node.left && node.left.color === Color.RED) || 
          (node.right && node.right.color === Color.RED)) {
        return { valid: false, message: "Red node has red child" };
      }
    }
    
    // Check black heights
    const leftBlackHeight = getBlackHeight(node.left ?? null);
    const rightBlackHeight = getBlackHeight(node.right ?? null);
    
    if (leftBlackHeight !== rightBlackHeight) {
      return { valid: false, message: "Black heights don't match" };
    }
    
    const leftValidation = validateRBTree(node.left ?? null);
    const rightValidation = validateRBTree(node.right ?? null);
    
    if (!leftValidation.valid) return leftValidation;
    if (!rightValidation.valid) return rightValidation;
    
    return { valid: true, message: "Valid Red-Black Tree" };
  };

  return (
    <div className="h-full flex flex-col p-2 sm:p-0">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-2 text-foreground">
          Red-Black Tree
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          A self-balancing BST where nodes are colored red or black with specific rules to maintain balance.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 flex-1">
        {/* Controls */}
        <div className="w-full lg:w-80 space-y-3 lg:space-y-4 order-2 lg:order-1">
          <div className="space-y-2">
            <label className="text-sm font-medium">Insert Value</label>
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
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={clearTree} disabled={!root} variant="outline" className="flex-1">
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear
            </Button>
            <Button
              onClick={() => {
                clearTree();
                setNextId(0);

                const demoValues = [10, 5, 15, 3, 7, 12, 18];
                let insertionIndex = 0;
                let currentRoot: RBNode | null = null;
                let currentNextId = 0;
                
                const insertNext = () => {
                  if (insertionIndex < demoValues.length) {
                    const value = demoValues[insertionIndex];
                    setInputValue(value.toString());
                    
                    setTimeout(() => {
                      // Use the local currentRoot instead of the state root
                      const newNode = createNode(value, currentNextId, Color.RED);
                      currentNextId++;
                      
                      if (!currentRoot) {
                        newNode.color = Color.BLACK;
                        newNode.isHighlighted = true;
                        currentRoot = newNode;
                      } else {
                        // Clone the current tree
                        const cloneTree = (node: RBNode | null): RBNode | null => {
                          if (!node) return null;
                          return {
                            ...node,
                            left: cloneTree(node.left),
                            right: cloneTree(node.right),
                            parent: null,
                          };
                        };
                        
                        currentRoot = cloneTree(currentRoot);
                        
                        // Rebuild parent references
                        const setParentRefs = (node: RBNode | null, parent: RBNode | null = null): void => {
                          if (!node) return;
                          node.parent = parent;
                          setParentRefs(node.left, node);
                          setParentRefs(node.right, node);
                        };
                        
                        setParentRefs(currentRoot);
                        
                        // Find insertion point
                        let current = currentRoot;
                        let parent: RBNode | null = null;
                        
                        while (current) {
                          parent = current;
                          if (value < current.value) {
                            current = current.left;
                          } else if (value > current.value) {
                            current = current.right;
                          } else {
                            // Value already exists, skip
                            insertionIndex++;
                            setTimeout(insertNext, 100);
                            return;
                          }
                        }
                        
                        // Insert new node
                        newNode.parent = parent;
                        if (value < parent!.value) {
                          parent!.left = newNode;
                        } else {
                          parent!.right = newNode;
                        }
                        
                        // Fix Red-Black tree violations
                        const rootRef = { current: currentRoot };
                        fixInsert(newNode, rootRef);
                        currentRoot = rootRef.current;
                      }
                      
                      // Update the state and UI
                      setNextId(currentNextId);
                      if (currentRoot) {
                        setRoot(calculatePositions(currentRoot));
                      }
                      setInputValue("");
                      
                      // Clear highlights after animation
                      setTimeout(() => {
                        setRoot((prev) => (prev ? clearHighlights(prev) : null));
                      }, 1500 / speed);
                      
                      insertionIndex++;
                      setTimeout(insertNext, 2500 / speed);
                    }, 200);
                  }
                };
                insertNext();
              }}
              variant="outline"
              className="flex-1"
            >
              Demo
            </Button>
          </div>

          {operationInfo && (
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                {operationInfo}
              </p>
            </div>
          )}

          {/* Red-Black Tree Rules */}
          <div className="p-3 bg-muted/50 rounded-lg space-y-2">
            <div className="text-sm font-medium">Red-Black Tree Rules:</div>
            <div className="space-y-1 text-xs">
              <div>1. Every node is red or black</div>
              <div>2. Root is always black</div>
              <div>3. Red nodes have black children</div>
              <div>4. All paths have same black height</div>
            </div>
          </div>

          {/* Legend */}
          {root && (
            <div className="p-3 bg-muted/50 rounded-lg space-y-2">
              <div className="text-sm font-medium">Node Colors:</div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>Red nodes (R)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-800"></div>
                  <span>Black nodes (B)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span>Newly inserted</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>Recently recolored</span>
                </div>
              </div>
            </div>
          )}

          {/* Tree Stats */}
          {root && (
            <div className="pt-4 border-t">
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Nodes:</span>
                  <span>{getNodeCount(root)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Height:</span>
                  <span>{getTreeHeight(root)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Black Height:</span>
                  <span>{getBlackHeight(root)}</span>
                </div>
              </div>
              
              {/* Validation Status */}
              <div className="mt-3 pt-3 border-t">
                {(() => {
                  const validation = validateRBTree(root);
                  return (
                    <div className={`text-xs p-2 rounded ${
                      validation.valid 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'
                    }`}>
                      <div className="font-medium">
                        {validation.valid ? '✓ Valid' : '✗ Invalid'}
                      </div>
                      <div>{validation.message}</div>
                    </div>
                  );
                })()}
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
                viewBox="-300 -40 600 400"
                preserveAspectRatio="xMidYMid meet"
                style={{ minHeight: "250px" }}
              >
                <g>
                  {renderConnections(root)}
                  {renderNodes(root)}
                </g>
              </svg>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <Binary className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4 opacity-40" />
                <p className="text-sm sm:text-base font-medium mb-2">
                  Insert numbers to build your Red-Black tree
                </p>
                <p className="text-xs sm:text-sm opacity-60">
                  Self-balancing with color rules
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}