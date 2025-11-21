"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Minus, Search, RotateCcw, Binary } from "lucide-react";

interface SplayTreeVisualizationProps {
  speed: number;
}

interface SplayNode {
  id: number;
  value: number;
  left?: SplayNode | null;
  right?: SplayNode | null;
  x?: number;
  y?: number;
  isHighlighted?: boolean;
  isSplayed?: boolean;
  isAccessed?: boolean;
}

export default function SplayTreeVisualization({ speed }: SplayTreeVisualizationProps) {
  const [root, setRoot] = useState<SplayNode | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [nextId, setNextId] = useState(0);
  const [splayInfo, setSplayInfo] = useState<string>("");
  const [accessCount, setAccessCount] = useState<{ [key: number]: number }>({});

  // Calculate positions for tree nodes with better spacing
  const calculatePositions = useCallback(
    (node: SplayNode | null, x = 0, y = 0, level = 0): SplayNode | null => {
      if (!node) return null;

      // Calculate subtree sizes to determine spacing
      const getSubtreeSize = (n: SplayNode | null): number => {
        if (!n) return 0;
        return 1 + getSubtreeSize(n.left) + getSubtreeSize(n.right);
      };

      const leftSize = getSubtreeSize(node.left);
      const rightSize = getSubtreeSize(node.right);
      
      // Dynamic spacing based on subtree sizes and level
      const baseSpacing = Math.max(80, 200 / Math.pow(1.5, level));
      const leftSpacing = Math.max(baseSpacing, leftSize * 30);
      const rightSpacing = Math.max(baseSpacing, rightSize * 30);
      const verticalSpacing = 80;

      const newNode = { ...node, x, y };

      if (node.left) {
        newNode.left = calculatePositions(
          node.left,
          x - leftSpacing,
          y + verticalSpacing,
          level + 1
        );
      }

      if (node.right) {
        newNode.right = calculatePositions(
          node.right,
          x + rightSpacing,
          y + verticalSpacing,
          level + 1
        );
      }

      return newNode;
    },
    []
  );

  // Right rotate (Zig)
  const rotateRight = useCallback((y: SplayNode): SplayNode => {
    const x = y.left!;
    y.left = x.right;
    x.right = y;
    
    setSplayInfo("Zig (Right rotation)");
    setTimeout(() => setSplayInfo(""), 1500);
    
    return { ...x, isSplayed: true };
  }, []);

  // Left rotate (Zag)
  const rotateLeft = useCallback((x: SplayNode): SplayNode => {
    const y = x.right!;
    x.right = y.left;
    y.left = x;
    
    setSplayInfo("Zag (Left rotation)");
    setTimeout(() => setSplayInfo(""), 1500);
    
    return { ...y, isSplayed: true };
  }, []);

  // Splay operation - brings node with given value to root
  const splay = useCallback((root: SplayNode | null, value: number): SplayNode | null => {
    if (!root || root.value === value) {
      return root ? { ...root, isSplayed: true } : null;
    }

    // Value is in left subtree
    if (value < root.value) {
      if (!root.left) return root;

      // Zig-Zig (Left Left)
      if (value < root.left.value) {
        // Recursively bring value as root of left-left
        root.left.left = splay(root.left.left || null, value);
        
        // Do first rotation for root
        root = rotateRight(root);
        
        setSplayInfo("Zig-Zig (Left-Left case)");
      }
      // Zig-Zag (Left Right)
      else if (value > root.left.value) {
        // Recursively bring value as root of left-right
        root.left.right = splay(root.left.right || null, value);
        
        // Do first rotation for root.left
        if (root.left.right) {
          root.left = rotateLeft(root.left);
        }
        
        setSplayInfo("Zig-Zag (Left-Right case)");
      }

      // Do second rotation for root
      return root.left ? rotateRight(root) : root;
    }
    // Value is in right subtree
    else {
      if (!root.right) return root;

      // Zag-Zag (Right Right)
      if (value > root.right.value) {
        // Recursively bring value as root of right-right
        root.right.right = splay(root.right.right || null, value);
        
        // Do first rotation for root
        root = rotateLeft(root);
        
        setSplayInfo("Zag-Zag (Right-Right case)");
      }
      // Zag-Zig (Right Left)
      else if (value < root.right.value) {
        // Recursively bring value as root of right-left
        root.right.left = splay(root.right.left || null, value);
        
        // Do first rotation for root.right
        if (root.right.left) {
          root.right = rotateRight(root.right);
        }
        
        setSplayInfo("Zag-Zig (Right-Left case)");
      }

      // Do second rotation for root
      return root.right ? rotateLeft(root) : root;
    }
  }, [rotateLeft, rotateRight]);

  // Insert a value into the Splay tree
  const insertSplay = useCallback((rootNode: SplayNode | null, value: number, currentId: number): SplayNode => {
    let root = rootNode;
    // If tree is empty
    if (!root) {
      return {
        id: currentId,
        value,
        isHighlighted: true,
        isSplayed: true,
        x: 0,
        y: 0,
      };
    }

    // Splay the tree with the given value
    root = splay(root, value);

    // If value already exists
    if (root && root.value === value) {
      return { ...root, isHighlighted: true };
    }

    // Create new node
    const newNode: SplayNode = {
      id: currentId,
      value,
      isHighlighted: true,
      isSplayed: true,
      x: 0,
      y: 0,
    };

    // If root is null or value is smaller than root
    if (!root || value < root.value) {
      newNode.right = root;
      newNode.left = root ? root.left : null;
      if (root) root.left = null;
    }
    // If value is greater than root
    else {
      newNode.left = root;
      newNode.right = root.right;
      root.right = null;
    }

    setSplayInfo(`Inserted ${value} and splayed to root`);
    return newNode;
  }, [splay]);

  // Search for a value and splay it to root
  const searchSplay = useCallback((value: number) => {
    if (!root) return;

    // Update access count
    setAccessCount(prev => ({
      ...prev,
      [value]: (prev[value] || 0) + 1
    }));

    const newRoot = splay(root, value);
    if (newRoot) {
      const updatedRoot = { ...newRoot, isAccessed: true };
      setRoot(calculatePositions(updatedRoot));
      
      if (newRoot.value === value) {
        setSplayInfo(`Found ${value} and splayed to root`);
      } else {
        setSplayInfo(`${value} not found, but splayed closest node`);
      }
    }
  }, [root, calculatePositions, splay]);

  // Delete a value from the Splay tree
  const deleteSplay = (root: SplayNode | null, value: number): SplayNode | null => {
    if (!root) return null;

    // Splay the node to be deleted to root
    root = splay(root, value);

    if (!root || root.value !== value) {
      return root; // Value not found
    }

    let newRoot: SplayNode | null = null;

    // If only right subtree exists
    if (!root.left) {
      newRoot = root.right || null;
    }
    // If only left subtree exists
    else if (!root.right) {
      newRoot = root.left || null;
    }
    // Both subtrees exist
    else {
      // Splay the maximum element in left subtree
      const leftSubtree = splay(root.left, value);
      if (leftSubtree) {
        leftSubtree.right = root.right;
        newRoot = leftSubtree;
      }
    }

    setSplayInfo(`Deleted ${value} from tree`);
    return newRoot;
  };

  // Clear highlights helper
  const clearHighlights = useCallback((node: SplayNode): SplayNode => {
    return {
      ...node,
      isHighlighted: false,
      isSplayed: false,
      isAccessed: false,
      left: node.left ? clearHighlights(node.left) : null,
      right: node.right ? clearHighlights(node.right) : null,
    };
  }, []);

  const insert = useCallback(() => {
    const value = parseInt(inputValue);
    if (!isNaN(value)) {
      const currentId = nextId;
      setNextId((prev) => prev + 1);
      const newRoot = insertSplay(root, value, currentId);
      setRoot(calculatePositions(newRoot));
      setInputValue("");

      // Clear highlights after animation
      setTimeout(() => {
        setRoot((prev) => (prev ? clearHighlights(prev) : null));
      }, 2000 / speed);
    }
  }, [inputValue, nextId, root, insertSplay, calculatePositions, speed, clearHighlights]);

  const search = () => {
    const value = parseInt(searchValue);
    if (!isNaN(value) && root) {
      searchSplay(value);
      setSearchValue("");

      // Clear highlights after animation
      setTimeout(() => {
        setRoot((prev) => (prev ? clearHighlights(prev) : null));
      }, 2000 / speed);
    }
  };

  const deleteValue = () => {
    const value = parseInt(inputValue);
    if (!isNaN(value) && root) {
      const newRoot = deleteSplay(root, value);
      setRoot(newRoot ? calculatePositions(newRoot) : null);
      setInputValue("");
    }
  };

  const clearTree = () => {
    setRoot(null);
    setSplayInfo("");
    setAccessCount({});
  };

  // Render tree connections
  const renderConnections = (node: SplayNode | null): React.ReactElement[] => {
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

  // Render nodes with splay visualization
  const renderNodes = (node: SplayNode | null): React.ReactElement[] => {
    if (!node) return [];

    const nodes: React.ReactElement[] = [];
    const nodeRadius = 20;

    if (node.x !== undefined && node.y !== undefined) {
      let nodeColor, textColor, strokeColor;
      const accessFrequency = accessCount[node.value] || 0;

      if (node.isSplayed) {
        nodeColor = "#10b981"; // Green for splayed nodes
        textColor = "white";
        strokeColor = "#10b981";
      } else if (node.isAccessed) {
        nodeColor = "#f59e0b"; // Orange for accessed nodes
        textColor = "white";
        strokeColor = "#f59e0b";
      } else if (node.isHighlighted) {
        nodeColor = "#3b82f6"; // Blue for newly inserted
        textColor = "white";
        strokeColor = "#3b82f6";
      } else if (accessFrequency > 0) {
        // Color based on access frequency
        const intensity = Math.min(accessFrequency / 3, 1);
        nodeColor = `rgba(139, 92, 246, ${0.3 + intensity * 0.7})`; // Purple with varying intensity
        textColor = intensity > 0.5 ? "white" : "#1e293b";
        strokeColor = "#8b5cf6";
      } else {
        nodeColor = "#f8fafc";
        textColor = "#1e293b";
        strokeColor = "#64748b";
      }

      nodes.push(
        <motion.g
          key={node.id}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: node.isSplayed ? [1, 1.2, 1] : 1, 
            opacity: 1 
          }}
          transition={{ 
            duration: 0.3 / speed, 
            ease: "easeOut",
            scale: { duration: 0.6, times: [0, 0.5, 1] }
          }}
        >
          {/* Pulse effect for splayed nodes */}
          {node.isSplayed && (
            <motion.circle
              cx={node.x}
              cy={node.y}
              r={nodeRadius + 8}
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
              opacity="0.6"
              animate={{
                r: [nodeRadius + 8, nodeRadius + 15, nodeRadius + 8],
                opacity: [0.6, 0.2, 0.6],
              }}
              transition={{
                duration: 1,
                repeat: 2,
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

          {/* Access count indicator */}
          {accessFrequency > 0 && (
            <text
              x={node.x + nodeRadius + 8}
              y={node.y - nodeRadius - 5}
              textAnchor="middle"
              dominantBaseline="middle"
              className="font-mono select-none text-xs"
              fill="#8b5cf6"
              fontSize="10"
            >
              {accessFrequency}x
            </text>
          )}

          {/* Root indicator */}
          {node.x === 0 && node.y === 0 && (
            <text
              x={node.x}
              y={node.y - nodeRadius - 15}
              textAnchor="middle"
              dominantBaseline="middle"
              className="font-bold select-none text-xs"
              fill="#10b981"
              fontSize="10"
            >
              ROOT
            </text>
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

  const getTreeHeight = (node: SplayNode | null): number => {
    if (!node) return 0;
    return 1 + Math.max(getTreeHeight(node.left || null), getTreeHeight(node.right || null));
  };

  const getNodeCount = (node: SplayNode | null): number => {
    if (!node) return 0;
    return 1 + getNodeCount(node.left || null) + getNodeCount(node.right || null);
  };

  // Calculate the bounding box of all nodes
  const getTreeBounds = (node: SplayNode | null): { minX: number; maxX: number; minY: number; maxY: number } => {
    if (!node || node.x === undefined || node.y === undefined) {
      return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    }

    const bounds = { minX: node.x, maxX: node.x, minY: node.y, maxY: node.y };

    if (node.left) {
      const leftBounds = getTreeBounds(node.left);
      bounds.minX = Math.min(bounds.minX, leftBounds.minX);
      bounds.maxX = Math.max(bounds.maxX, leftBounds.maxX);
      bounds.minY = Math.min(bounds.minY, leftBounds.minY);
      bounds.maxY = Math.max(bounds.maxY, leftBounds.maxY);
    }

    if (node.right) {
      const rightBounds = getTreeBounds(node.right);
      bounds.minX = Math.min(bounds.minX, rightBounds.minX);
      bounds.maxX = Math.max(bounds.maxX, rightBounds.maxX);
      bounds.minY = Math.min(bounds.minY, rightBounds.minY);
      bounds.maxY = Math.max(bounds.maxY, rightBounds.maxY);
    }

    return bounds;
  };

  return (
    <div className="h-full flex flex-col p-2 sm:p-0">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-2 text-foreground">
          Splay Tree
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          A self-adjusting BST that moves frequently accessed nodes closer to the root via splaying.
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

          <div className="space-y-2">
            <label className="text-sm font-medium">Search & Splay</label>
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
                disabled={!searchValue.trim() || !root}
              >
                <Search className="h-4 w-4" />
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
                let currentRoot: SplayNode | null = null;
                let currentNextId = 0;
                setNextId(0);

                // Insert values to create a more balanced initial tree
                const demoValues = [50, 30, 70, 20, 40, 60, 80];
                
                demoValues.forEach((val, index) => {
                  setTimeout(() => {
                    const newRoot = insertSplay(currentRoot, val, currentNextId);
                    currentRoot = newRoot;
                    setRoot(calculatePositions(newRoot));
                    setNextId(currentNextId + 1);
                    currentNextId++;
                    
                    // After inserting all values, demonstrate some splay operations
                    if (index === demoValues.length - 1) {
                      setTimeout(() => {
                        // Search for 20 to splay it to root
                        setAccessCount(prev => ({ ...prev, 20: (prev[20] || 0) + 1 }));
                        const splayedRoot = splay(currentRoot, 20);
                        if (splayedRoot) {
                          currentRoot = { ...splayedRoot, isAccessed: true };
                          setRoot(calculatePositions(currentRoot));
                        }
                      }, 1500);
                      
                      setTimeout(() => {
                        // Search for 80 to splay it to root
                        setAccessCount(prev => ({ ...prev, 80: (prev[80] || 0) + 1 }));
                        const splayedRoot = splay(currentRoot, 80);
                        if (splayedRoot) {
                          currentRoot = { ...splayedRoot, isAccessed: true };
                          setRoot(calculatePositions(currentRoot));
                        }
                      }, 3000);
                    }
                  }, index * 1000);
                });
              }}
              variant="outline"
              className="flex-1"
            >
              Demo
            </Button>
          </div>

          {splayInfo && (
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                {splayInfo}
              </p>
            </div>
          )}

          {/* Splay Operations Info */}
          <div className="p-3 bg-muted/50 rounded-lg space-y-2">
            <div className="text-sm font-medium">Splay Operations:</div>
            <div className="space-y-1 text-xs">
              <div><strong>Zig:</strong> Single rotation</div>
              <div><strong>Zig-Zig:</strong> Same direction rotations</div>
              <div><strong>Zig-Zag:</strong> Opposite direction rotations</div>
            </div>
          </div>

          {/* Legend */}
          {root && (
            <div className="p-3 bg-muted/50 rounded-lg space-y-2">
              <div className="text-sm font-medium">Node Types:</div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>Splayed to root</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span>Recently accessed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span>Newly inserted</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span>Frequently accessed</span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Numbers next to nodes show access frequency
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
                  <span>Root:</span>
                  <span>{root.value}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Visualization */}
        <div className="flex-1 relative min-h-[300px] lg:min-h-[400px] order-1 lg:order-2 bg-background rounded-lg border overflow-hidden">
          {root ? (
            <div className="w-full h-full flex items-center justify-center p-4">
              {(() => {
                const bounds = getTreeBounds(root);
                const padding = 100;
                const viewBoxWidth = Math.max(600, bounds.maxX - bounds.minX + 2 * padding);
                const viewBoxHeight = Math.max(400, bounds.maxY - bounds.minY + 2 * padding);
                const viewBoxX = bounds.minX - padding;
                const viewBoxY = bounds.minY - padding;
                
                return (
                  <svg
                    className="w-full h-full max-w-full max-h-full"
                    viewBox={`${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`}
                    preserveAspectRatio="xMidYMid meet"
                    style={{ minHeight: "250px" }}
                  >
                    <g>
                      {renderConnections(root)}
                      {renderNodes(root)}
                    </g>
                  </svg>
                );
              })()}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <Binary className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4 opacity-40" />
                <p className="text-sm sm:text-base font-medium mb-2">
                  Insert numbers to build your Splay tree
                </p>
                <p className="text-xs sm:text-sm opacity-60">
                  Self-adjusting with splaying operations
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}