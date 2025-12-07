"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, Search, RotateCcw, GitBranch } from "lucide-react";

interface RadixTreeVisualizationProps {
  speed: number;
}

interface RadixNode {
  id: string;
  label: string;
  children: Map<string, RadixNode>;
  isEndOfWord: boolean;
  x: number;
  y: number;
  isHighlighted?: boolean;
}

export default function RadixTreeVisualization({ speed }: RadixTreeVisualizationProps) {
  const [root, setRoot] = useState<RadixNode | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [words, setWords] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [searchPath, setSearchPath] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState("");

  const generateId = useCallback(() => {
    return `radix-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }, []);

  const createNode = useCallback(
    (label = ""): RadixNode => {
      return {
        id: generateId(),
        label,
        children: new Map(),
        isEndOfWord: false,
        x: 0,
        y: 0,
        isHighlighted: false,
      };
    },
    [generateId]
  );

  const calculatePositions = useCallback(
    (node: RadixNode, x = 0, y = 0, level = 0): RadixNode => {
      const newNode = { ...node, x, y };
      const children = Array.from(node.children.entries());

      if (children.length > 0) {
        const spacing = Math.max(60, 250 / Math.pow(1.5, level));
        const startX = x - ((children.length - 1) * spacing) / 2;

        const newChildren = new Map<string, RadixNode>();
        children.forEach(([key, child], index) => {
          const childX = startX + index * spacing;
          const positionedChild = calculatePositions(child, childX, y + 70, level + 1);
          newChildren.set(key, positionedChild);
        });

        newNode.children = newChildren;
      }

      return newNode;
    },
    []
  );

  const findCommonPrefix = (str1: string, str2: string): string => {
    let i = 0;
    while (i < str1.length && i < str2.length && str1[i] === str2[i]) {
      i++;
    }
    return str1.substring(0, i);
  };

  const insertWord = useCallback(
    (node: RadixNode, word: string): RadixNode => {
      if (word.length === 0) {
        return { ...node, isEndOfWord: true, isHighlighted: true };
      }

      const firstChar = word[0];
      const newChildren = new Map(node.children);

      for (const [key, child] of node.children.entries()) {
        if (key[0] === firstChar) {
          const commonPrefix = findCommonPrefix(key, word);

          if (commonPrefix === key) {
            const remainingWord = word.substring(commonPrefix.length);
            newChildren.set(key, insertWord(child, remainingWord));
            return { ...node, children: newChildren };
          } else if (commonPrefix.length > 0) {
            const splitNode = createNode(commonPrefix);
            splitNode.isHighlighted = true;

            const oldSuffix = key.substring(commonPrefix.length);
            const newSuffix = word.substring(commonPrefix.length);

            const oldChild = { ...child, label: oldSuffix };
            splitNode.children.set(oldSuffix, oldChild);

            if (newSuffix.length > 0) {
              const newChild = createNode(newSuffix);
              newChild.isEndOfWord = true;
              newChild.isHighlighted = true;
              splitNode.children.set(newSuffix, newChild);
            } else {
              splitNode.isEndOfWord = true;
            }

            newChildren.delete(key);
            newChildren.set(commonPrefix, splitNode);
            return { ...node, children: newChildren };
          }
        }
      }

      const newChild = createNode(word);
      newChild.isEndOfWord = true;
      newChild.isHighlighted = true;
      newChildren.set(word, newChild);

      return { ...node, children: newChildren };
    },
    [createNode]
  );

  const searchWord = async (word: string): Promise<void> => {
    if (!root) {
      setSearchResult(`"${word}" not found - tree is empty`);
      return;
    }

    setIsSearching(true);
    setSearchPath([]);
    setSearchResult("Starting search...");

    let current = root;
    let remaining = word;
    const path: string[] = [root.id];

    while (remaining.length > 0) {
      setSearchPath([...path]);
      setSearchResult(`Looking for "${remaining}"...`);

      await new Promise((resolve) =>
        setTimeout(resolve, Math.max(600, 1000 / speed))
      );

      let found = false;

      for (const [key, child] of current.children.entries()) {
        if (remaining.startsWith(key)) {
          current = child;
          path.push(child.id);
          remaining = remaining.substring(key.length);
          found = true;
          break;
        }
      }

      if (!found) {
        setSearchResult(`❌ "${word}" not found in tree`);
        setIsSearching(false);
        setTimeout(() => {
          setSearchPath([]);
        }, 3000);
        return;
      }
    }

    setSearchPath([...path]);

    if (current.isEndOfWord) {
      setSearchResult(`🎯 Found "${word}" in tree!`);
    } else {
      setSearchResult(`❌ "${word}" is a prefix but not a complete word`);
    }

    setIsSearching(false);
    setTimeout(() => {
      setSearchPath([]);
    }, 3000);
  };

  const clearHighlights = useCallback((node: RadixNode): RadixNode => {
    const newChildren = new Map<string, RadixNode>();
    node.children.forEach((child, key) => {
      newChildren.set(key, clearHighlights(child));
    });

    return {
      ...node,
      isHighlighted: false,
      children: newChildren,
    };
  }, []);

  const insert = useCallback(() => {
    const word = inputValue.trim().toLowerCase();
    if (!word || !/^[a-z]+$/.test(word)) {
      setMessage("Please enter only letters (a-z)");
      setTimeout(() => setMessage(""), 2000);
      return;
    }

    if (words.includes(word)) {
      setMessage(`"${word}" already exists`);
      setTimeout(() => setMessage(""), 2000);
      return;
    }

    setMessage(`Inserting "${word}"`);

    if (!root) {
      const newRoot = createNode("");
      const updatedRoot = insertWord(newRoot, word);
      setRoot(calculatePositions(updatedRoot));
    } else {
      const updatedRoot = insertWord(root, word);
      setRoot(calculatePositions(updatedRoot));
    }

    setWords([...words, word].sort());
    setInputValue("");

    setTimeout(() => {
      setRoot((prev) => (prev ? clearHighlights(prev) : null));
      setMessage("");
    }, 1000);
  }, [inputValue, root, words, createNode, insertWord, calculatePositions, clearHighlights]);

  const deleteValue = () => {
    setMessage("Delete operation not fully implemented");
    setTimeout(() => setMessage(""), 2000);
  };

  const search = () => {
    const word = searchValue.trim().toLowerCase();
    if (!word || !root) return;

    setSearchResult("");
    setSearchPath([]);
    searchWord(word);
  };

  const clearTree = () => {
    setRoot(null);
    setWords([]);
    setSearchPath([]);
    setSearchResult("");
    setMessage("");
  };

  const renderRadixNode = (node: RadixNode): React.ReactElement => {
    const isInSearchPath = searchPath.includes(node.id);
    const labelWidth = Math.max(node.label.length * 8 + 16, 40);
    const nodeHeight = 28;

    let nodeColor, textClass, strokeColor;

    if (isInSearchPath) {
      nodeColor = "#ef4444";
      textClass = "fill-white";
      strokeColor = "#ef4444";
    } else if (node.isHighlighted) {
      nodeColor = "#3b82f6";
      textClass = "fill-white";
      strokeColor = "#3b82f6";
    } else if (node.isEndOfWord) {
      nodeColor = "#10b981";
      textClass = "fill-white";
      strokeColor = "#10b981";
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
          scale: 1,
          opacity: 1,
          transition: { duration: 0.3 / speed, ease: "easeOut" },
        }}
      >
        <rect
          x={node.x - labelWidth / 2}
          y={node.y - nodeHeight / 2}
          width={labelWidth}
          height={nodeHeight}
          fill={nodeColor}
          stroke={strokeColor}
          strokeWidth="2"
          rx="4"
        />

        {node.isEndOfWord && (
          <rect
            x={node.x - labelWidth / 2 + 3}
            y={node.y - nodeHeight / 2 + 3}
            width={labelWidth - 6}
            height={nodeHeight - 6}
            fill="none"
            stroke={strokeColor}
            strokeWidth="1"
            rx="3"
          />
        )}

        <text
          x={node.x}
          y={node.y}
          textAnchor="middle"
          dominantBaseline="middle"
          className={`font-semibold select-none ${textClass}`}
          fontSize="11"
        >
          {node.label || "⌀"}
        </text>
      </motion.g>
    );
  };

  const renderConnections = (node: RadixNode): React.ReactElement[] => {
    const connections: React.ReactElement[] = [];
    const nodeHeight = 28;

    node.children.forEach((child) => {
      const isInSearchPath =
        searchPath.includes(node.id) && searchPath.includes(child.id);

      connections.push(
        <motion.line
          key={`connection-${node.id}-${child.id}`}
          x1={node.x}
          y1={node.y + nodeHeight / 2}
          x2={child.x}
          y2={child.y - nodeHeight / 2}
          stroke={isInSearchPath ? "#ef4444" : "#64748b"}
          strokeWidth={isInSearchPath ? "3" : "2"}
          opacity="1"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5 }}
        />
      );

      connections.push(...renderConnections(child));
    });

    return connections;
  };

  const renderAllNodes = (node: RadixNode): React.ReactElement[] => {
    const nodes: React.ReactElement[] = [renderRadixNode(node)];

    node.children.forEach((child) => {
      nodes.push(...renderAllNodes(child));
    });

    return nodes;
  };

  const getNodeCount = (node: RadixNode | null): number => {
    if (!node) return 0;
    let count = 1;
    node.children.forEach((child) => {
      count += getNodeCount(child);
    });
    return count;
  };

  return (
    <div className="h-full flex flex-col p-2 sm:p-0">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-2 text-foreground">
          Radix Tree
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Compressed trie that merges nodes with single children, storing edge labels.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 flex-1">
        <div className="w-full lg:w-80 space-y-3 lg:space-y-4 order-2 lg:order-1 max-h-[50vh] lg:max-h-none overflow-y-auto lg:overflow-visible">
          <div className="space-y-2">
            <label className="text-sm font-medium">Insert/Delete Word</label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter word..."
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
            <label className="text-sm font-medium">Search Word</label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search word..."
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
                const demoWords = ["romane", "romanus", "romulus", "rubens", "ruber", "rubicon", "rubicundus"];

                demoWords.forEach((word, index) => {
                  setTimeout(() => {
                    setInputValue(word);
                    setTimeout(() => {
                      setMessage(`Inserting "${word}"`);

                      setRoot((currentRoot) => {
                        if (!currentRoot) {
                          const newRoot = createNode("");
                          return calculatePositions(insertWord(newRoot, word));
                        } else {
                          return calculatePositions(insertWord(currentRoot, word));
                        }
                      });

                      setWords((prev) => [...prev, word].sort());
                      setInputValue("");

                      setTimeout(() => {
                        setRoot((prev) => (prev ? clearHighlights(prev) : null));
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
              <div className="text-sm font-medium">Legend:</div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: "#10b981" }}
                  ></div>
                  <span>End of word</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: "#3b82f6" }}
                  ></div>
                  <span>Newly inserted/split</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: "#ef4444" }}
                  ></div>
                  <span>Search path</span>
                </div>
              </div>
            </div>
          )}

          {words.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">
                Stored Words ({words.length}):
              </div>
              <div className="flex flex-wrap gap-1">
                {words.map((word) => (
                  <Badge key={word} variant="secondary">
                    {word}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {root && (
            <div className="pt-4 border-t">
              <div className="text-sm">
                <span>Total Nodes: {getNodeCount(root)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 relative min-h-[300px] lg:min-h-[400px] order-1 lg:order-2 bg-background rounded-lg border overflow-hidden">
          {root ? (
            <div className="w-full h-full flex items-center justify-center p-4 overflow-auto">
              <svg
                className="w-full h-full max-w-full max-h-full"
                viewBox="-300 -40 600 450"
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
                <GitBranch className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4 opacity-40" />
                <p className="text-sm sm:text-base font-medium mb-2">
                  Insert words to build your Radix Tree
                </p>
                <p className="text-xs sm:text-sm opacity-60">
                  Compressed trie with edge labels
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
