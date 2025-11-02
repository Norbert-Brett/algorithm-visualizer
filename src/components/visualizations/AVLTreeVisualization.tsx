"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Minus, RotateCcw, Binary } from "lucide-react";

interface AVLTreeVisualizationProps {
  speed: number;
}

interface AVLNode {
  id: number;
  value: number;
  height: number;
  balance: number;
  left?: AVLNode | null;
  right?: AVLNode | null;
  x?: number;
  y?: number;
  isHighlighted?: boolean;
  isRotated?: boolean;
}

export default function AVLTreeVisualization({ speed }: AVLTreeVisualizationProps) {
  const [root, setRoot] = useState<AVLNode | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [nextId, setNextId] = useState(0);
  const [rotationInfo, setRotationInfo] = useState<string>("");

  // Calculate height of a node
  const getHeight = useCallback((node: AVLNode | null): number => {
    return node ? node.height : 0;
  }, []);

  // Calculate balance factor
  const getBalance = useCallback((node: AVLNode | null): number => {
    return node ? getHeight(node.left || null) - getHeight(node.right || null) : 0;
  }, [getHeight]);

  // Update height and balance of a node
  const updateNode = useCallback((node: AVLNode): AVLNode => {
    const leftHeight = getHeight(node.left || null);
    const rightHeight = getHeight(node.right || null);
    return {
      ...node,
      height: Math.max(leftHeight, rightHeight) + 1,
      balance: leftHeight - rightHeight,
    };
  }, [getHeight]);

  // Right rotate
  const rotateRight = useCallback((y: AVLNode): AVLNode => {
    const x = y.left!;
    const T2 = x.right;

    // Perform rotation
    x.right = updateNode(y);
    x.right.left = T2;

    // Update heights and balances
    const newY = updateNode(x.right);
    const newX = updateNode({ ...x, right: newY, isRotated: true });

    setRotationInfo("Right rotation performed");
    setTimeout(() => setRotationInfo(""), 2000);

    return newX;
  }, [updateNode]);

  // Left rotate
  const rotateLeft = useCallback((x: AVLNode): AVLNode => {
    const y = x.right!;
    const T2 = y.left;

    // Perform rotation
    y.left = updateNode(x);
    y.left.right = T2;

    // Update heights and balances
    const newX = updateNode(y.left);
    const newY = updateNode({ ...y, left: newX, isRotated: true });

    setRotationInfo("Left rotation performed");
    setTimeout(() => setRotationInfo(""), 2000);

    return newY;
  }, [updateNode]);

  // Calculate positions for tree nodes
  const calculatePositions = useCallback(
    (node: AVLNode | null, x = 0, y = 0, level = 0): AVLNode | null => {
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

  // Insert a value into the AVL tree
  const insertNode = useCallback(
    (node: AVLNode | null, value: number, currentId: number): AVLNode => {
      // Step 1: Perform normal BST insertion
      if (!node) {
        return {
          id: currentId,
          value,
          height: 1,
          balance: 0,
          isHighlighted: true,
          x: 0,
          y: 0,
        };
      }

      if (value < node.value) {
        node = {
          ...node,
          left: insertNode(node.left || null, value, currentId),
        };
      } else if (value > node.value) {
        node = {
          ...node,
          right: insertNode(node.right || null, value, currentId),
        };
      } else {
        return node; // Equal values not allowed
      }

      // Step 2: Update height and balance
      node = updateNode(node);

      // Step 3: Get the balance factor
      const balance = getBalance(node);

      // Step 4: If unbalanced, there are 4 cases

      // Left Left Case
      if (balance > 1 && value < (node.left?.value || 0)) {
        return rotateRight(node);
      }

      // Right Right Case
      if (balance < -1 && value > (node.right?.value || 0)) {
        return rotateLeft(node);
      }

      // Left Right Case
      if (balance > 1 && value > (node.left?.value || 0)) {
        node.left = rotateLeft(node.left!);
        return rotateRight(node);
      }

      // Right Left Case
      if (balance < -1 && value < (node.right?.value || 0)) {
        node.right = rotateRight(node.right!);
        return rotateLeft(node);
      }

      return node;
    },
    [getBalance, rotateLeft, rotateRight, updateNode]
  );

  // Delete a node from the AVL tree
  const deleteNode = (node: AVLNode | null, value: number): AVLNode | null => {
    // Step 1: Perform standard BST delete
    if (!node) return null;

    if (value < node.value) {
      node = {
        ...node,
        left: deleteNode(node.left || null, value),
      };
    } else if (value > node.value) {
      node = {
        ...node,
        right: deleteNode(node.right || null, value),
      };
    } else {
      // Node to be deleted found
      if (!node.left || !node.right) {
        const temp = node.left || node.right;
        if (!temp) {
          return null;
        } else {
          node = temp;
        }
      } else {
        // Node with two children
        const findMin = (n: AVLNode): AVLNode => {
          while (n.left) n = n.left;
          return n;
        };

        const temp = findMin(node.right);
        node = {
          ...node,
          value: temp.value,
          right: deleteNode(node.right || null, temp.value),
        };
      }
    }

    // Step 2: Update height and balance
    node = updateNode(node);

    // Step 3: Get the balance factor
    const balance = getBalance(node);

    // Step 4: If unbalanced, there are 4 cases

    // Left Left Case
    if (balance > 1 && getBalance(node.left || null) >= 0) {
      return rotateRight(node);
    }

    // Left Right Case
    if (balance > 1 && getBalance(node.left || null) < 0) {
      node.left = rotateLeft(node.left!);
      return rotateRight(node);
    }

    // Right Right Case
    if (balance < -1 && getBalance(node.right || null) <= 0) {
      return rotateLeft(node);
    }

    // Right Left Case
    if (balance < -1 && getBalance(node.right || null) > 0) {
      node.right = rotateRight(node.right!);
      return rotateLeft(node);
    }

    return node;
  };

  // Clear highlights helper
  const clearHighlights = useCallback((node: AVLNode): AVLNode => {
    return {
      ...node,
      isHighlighted: false,
      isRotated: false,
      left: node.left ? clearHighlights(node.left) : null,
      right: node.right ? clearHighlights(node.right) : null,
    };
  }, []);

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
  }, [inputValue, nextId, root, insertNode, calculatePositions, speed, clearHighlights]);

  const deleteValue = () => {
    const value = parseInt(inputValue);
    if (!isNaN(value) && root) {
      const newRoot = deleteNode(root, value);
      setRoot(newRoot ? calculatePositions(newRoot) : null);
      setInputValue("");
    }
  };

  const clearTree = () => {
    setRoot(null);
    setRotationInfo("");
  };

  // Render tree connections
  const renderConnections = (node: AVLNode | null): React.ReactElement[] => {
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
          key={`${node.id}-left`}
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
          key={`${node.id}-right`}
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

  // Render nodes with balance factors
  const renderNodes = (node: AVLNode | null): React.ReactElement[] => {
    if (!node) return [];

    const nodes: React.ReactElement[] = [];
    const nodeRadius = 20;

    if (node.x !== undefined && node.y !== undefined) {
      let nodeColor, textColor, strokeColor;

      if (node.isRotated) {
        nodeColor = "#10b981"; // Green for rotated nodes
        textColor = "white";
        strokeColor = "#10b981";
      } else if (node.isHighlighted) {
        nodeColor = "#3b82f6"; // Blue for newly inserted
        textColor = "white";
        strokeColor = "#3b82f6";
      } else if (Math.abs(node.balance) > 1) {
        nodeColor = "#ef4444"; // Red for unbalanced
        textColor = "white";
        strokeColor = "#ef4444";
      } else {
        nodeColor = "#f8fafc";
        textColor = "#1e293b";
        strokeColor = "#64748b";
      }

      nodes.push(
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
            y={node.y - 2}
            textAnchor="middle"
            dominantBaseline="middle"
            className="font-semibold select-none"
            fill={textColor}
            fontSize="12"
          >
            {node.value}
          </text>

          {/* Balance factor */}
          <text
            x={node.x}
            y={node.y + 8}
            textAnchor="middle"
            dominantBaseline="middle"
            className="font-mono select-none"
            fill={textColor}
            fontSize="8"
          >
            {node.balance > 0 ? `+${node.balance}` : node.balance}
          </text>

          {/* Height indicator */}
          <text
            x={node.x + nodeRadius + 8}
            y={node.y - nodeRadius - 5}
            textAnchor="middle"
            dominantBaseline="middle"
            className="font-mono select-none text-xs"
            fill="#64748b"
            fontSize="10"
          >
            h:{node.height}
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

  const getTreeHeight = (node: AVLNode | null): number => {
    return node ? node.height : 0;
  };

  const getNodeCount = (node: AVLNode | null): number => {
    if (!node) return 0;
    return 1 + getNodeCount(node.left || null) + getNodeCount(node.right || null);
  };

  return (
    <div className="h-full flex flex-col p-2 sm:p-0">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-2 text-foreground">
          AVL Tree (Self-Balancing BST)
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          An AVL tree automatically balances itself using rotations to maintain O(log n) operations.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 flex-1">
        {/* Controls */}
        <div className="w-full lg:w-80 space-y-3 lg:space-y-4 order-2 lg:order-1">
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

          <div className="flex gap-2">
            <Button onClick={clearTree} disabled={!root} variant="outline" className="flex-1">
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear
            </Button>
            <Button
              onClick={() => {
                clearTree();
                let currentRoot: AVLNode | null = null;
                let currentNextId = 0;

                [10, 20, 30, 40, 50, 25].forEach((val, index) => {
                  setTimeout(() => {
                    const newRoot = insertNode(currentRoot, val, currentNextId);
                    currentRoot = newRoot;
                    currentNextId++;
                    setRoot(calculatePositions(newRoot));
                    setNextId(currentNextId);
                  }, index * 800);
                });
              }}
              variant="outline"
              className="flex-1"
            >
              Demo
            </Button>
          </div>

          {rotationInfo && (
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                {rotationInfo}
              </p>
            </div>
          )}

          {/* Legend */}
          {root && (
            <div className="p-3 bg-muted/50 rounded-lg space-y-2">
              <div className="text-sm font-medium">Node Types:</div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>Recently rotated</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span>Newly inserted</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>Unbalanced (|balance| &gt; 1)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-100 border border-slate-400"></div>
                  <span>Balanced nodes</span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Numbers show: value (top), balance factor (bottom), height (right)
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
                  Insert numbers to build your AVL tree
                </p>
                <p className="text-xs sm:text-sm opacity-60">
                  Self-balancing with rotations
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}