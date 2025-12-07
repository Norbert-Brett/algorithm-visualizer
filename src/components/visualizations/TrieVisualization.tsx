"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, Search, RotateCcw, FileText } from "lucide-react";

interface TrieVisualizationProps {
  speed: number;
}

interface TrieNode {
  id: string;
  char: string;
  children: Map<string, TrieNode>;
  isEndOfWord: boolean;
  x: number;
  y: number;
  isHighlighted?: boolean;
  isSearching?: boolean;
}

export default function TrieVisualization({ speed }: TrieVisualizationProps) {
  const [root, setRoot] = useState<TrieNode | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [words, setWords] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [searchPath, setSearchPath] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState("");

  const generateId = useCallback(() => {
    return `trie-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }, []);

  const createNode = useCallback(
    (char = ""): TrieNode => {
      return {
        id: generateId(),
        char,
        children: new Map(),
        isEndOfWord: false,
        x: 0,
        y: 0,
        isHighlighted: false,
        isSearching: false,
      };
    },
    [generateId]
  );

  const calculatePositions = useCallback(
    (node: TrieNode, x = 0, y = 0, level = 0): TrieNode => {
      const newNode = { ...node, x, y };
      const children = Array.from(node.children.entries());

      if (children.length > 0) {
        const spacing = Math.max(40, 200 / Math.pow(1.5, level));
        const startX = x - ((children.length - 1) * spacing) / 2;

        const newChildren = new Map<string, TrieNode>();
        children.forEach(([char, child], index) => {
          const childX = startX + index * spacing;
          const positionedChild = calculatePositions(child, childX, y + 60, level + 1);
          newChildren.set(char, positionedChild);
        });

        newNode.children = newChildren;
      }

      return newNode;
    },
    []
  );

  const insertWord = useCallback(
    (node: TrieNode, word: string, index = 0): TrieNode => {
      if (index === word.length) {
        return { ...node, isEndOfWord: true, isHighlighted: true };
      }

      const char = word[index].toLowerCase();
      const newChildren = new Map(node.children);

      if (newChildren.has(char)) {
        const child = newChildren.get(char)!;
        newChildren.set(char, insertWord(child, word, index + 1));
      } else {
        const newChild = createNode(char);
        newChildren.set(char, insertWord(newChild, word, index + 1));
      }

      return { ...node, children: newChildren };
    },
    [createNode]
  );

  const deleteWord = useCallback(
    (node: TrieNode, word: string, index = 0): TrieNode | null => {
      if (index === word.length) {
        if (!node.isEndOfWord) return node;

        const updatedNode = { ...node, isEndOfWord: false };

        if (updatedNode.children.size === 0) {
          return null;
        }

        return updatedNode;
      }

      const char = word[index].toLowerCase();
      if (!node.children.has(char)) {
        return node;
      }

      const newChildren = new Map(node.children);
      const child = node.children.get(char)!;
      const updatedChild = deleteWord(child, word, index + 1);

      if (updatedChild === null) {
        newChildren.delete(char);
      } else {
        newChildren.set(char, updatedChild);
      }

      if (newChildren.size === 0 && !node.isEndOfWord) {
        return null;
      }

      return { ...node, children: newChildren };
    },
    []
  );

  const searchWord = async (word: string): Promise<void> => {
    if (!root) {
      setSearchResult(`"${word}" not found - trie is empty`);
      return;
    }

    setIsSearching(true);
    setSearchPath([]);
    setSearchResult("Starting search...");

    let current = root;
    const path: string[] = [root.id];

    for (let i = 0; i < word.length; i++) {
      const char = word[i].toLowerCase();

      setSearchPath([...path]);
      setSearchResult(`Looking for '${char}'...`);

      await new Promise((resolve) =>
        setTimeout(resolve, Math.max(600, 1000 / speed))
      );

      if (!current.children.has(char)) {
        setSearchResult(`❌ "${word}" not found in trie`);
        setIsSearching(false);
        setTimeout(() => {
          setSearchPath([]);
        }, 3000);
        return;
      }

      current = current.children.get(char)!;
      path.push(current.id);
    }

    setSearchPath([...path]);

    if (current.isEndOfWord) {
      setSearchResult(`🎯 Found "${word}" in trie!`);
    } else {
      setSearchResult(`❌ "${word}" is a prefix but not a complete word`);
    }

    setIsSearching(false);
    setTimeout(() => {
      setSearchPath([]);
    }, 3000);
  };

  const clearHighlights = useCallback((node: TrieNode): TrieNode => {
    const newChildren = new Map<string, TrieNode>();
    node.children.forEach((child, char) => {
      newChildren.set(char, clearHighlights(child));
    });

    return {
      ...node,
      isHighlighted: false,
      isSearching: false,
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

  const deleteValue = useCallback(() => {
    const word = inputValue.trim().toLowerCase();
    if (!word || !root) return;

    if (!words.includes(word)) {
      setMessage(`"${word}" not found`);
      setTimeout(() => setMessage(""), 2000);
      return;
    }

    setMessage(`Deleting "${word}"`);

    const updatedRoot = deleteWord(root, word);
    setRoot(updatedRoot ? calculatePositions(updatedRoot) : null);
    setWords(words.filter((w) => w !== word));
    setInputValue("");

    setTimeout(() => setMessage(""), 1000);
  }, [inputValue, root, words, deleteWord, calculatePositions]);

  const search = () => {
    const word = searchValue.trim().toLowerCase();
    if (!word || !root) return;

    setSearchResult("");
    setSearchPath([]);
    searchWord(word);
  };

  const clearTrie = () => {
    setRoot(null);
    setWords([]);
    setSearchPath([]);
    setSearchResult("");
    setMessage("");
  };

  const renderTrieNode = (node: TrieNode): React.ReactElement => {
    const isInSearchPath = searchPath.includes(node.id);
    const nodeRadius = 16;

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
        <circle
          cx={node.x}
          cy={node.y}
          r={nodeRadius}
          fill={nodeColor}
          stroke={strokeColor}
          strokeWidth="2"
        />

        {node.isEndOfWord && (
          <circle
            cx={node.x}
            cy={node.y}
            r={nodeRadius - 4}
            fill="none"
            stroke={strokeColor}
            strokeWidth="1"
          />
        )}

        <text
          x={node.x}
          y={node.y}
          textAnchor="middle"
          dominantBaseline="middle"
          className={`font-semibold select-none ${textClass}`}
          fontSize="12"
        >
          {node.char || "⌀"}
        </text>
      </motion.g>
    );
  };

  const renderConnections = (node: TrieNode): React.ReactElement[] => {
    const connections: React.ReactElement[] = [];
    const nodeRadius = 16;

    node.children.forEach((child) => {
      const isInSearchPath =
        searchPath.includes(node.id) && searchPath.includes(child.id);

      connections.push(
        <motion.line
          key={`connection-${node.id}-${child.id}`}
          x1={node.x}
          y1={node.y + nodeRadius}
          x2={child.x}
          y2={child.y - nodeRadius}
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

  const renderAllNodes = (node: TrieNode): React.ReactElement[] => {
    const nodes: React.ReactElement[] = [renderTrieNode(node)];

    node.children.forEach((child) => {
      nodes.push(...renderAllNodes(child));
    });

    return nodes;
  };

  const getNodeCount = (node: TrieNode | null): number => {
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
          Trie (Prefix Tree)
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Efficient data structure for storing and searching strings with common prefixes.
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
              onClick={clearTrie}
              disabled={!root}
              variant="outline"
              className="flex-1"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear
            </Button>
            <Button
              onClick={() => {
                clearTrie();
                const demoWords = ["cat", "car", "card", "care", "careful", "dog", "dodge"];

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
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: "#10b981" }}
                  ></div>
                  <span>End of word</span>
                </div>
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
                viewBox="-250 -40 500 500"
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
                <FileText className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4 opacity-40" />
                <p className="text-sm sm:text-base font-medium mb-2">
                  Insert words to build your Trie
                </p>
                <p className="text-xs sm:text-sm opacity-60">
                  Efficient prefix-based string storage
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
