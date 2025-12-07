"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Play, RotateCcw, GitBranch } from "lucide-react";

interface StringReversalVisualizationProps {
  speed: number;
}

interface RecursionNode {
  id: number;
  input: string;
  output?: string;
  level: number;
  isActive: boolean;
  isReturning: boolean;
  isBaseCase: boolean;
}

export default function StringReversalVisualization({
  speed,
}: StringReversalVisualizationProps) {
  const [inputValue, setInputValue] = useState("");
  const [recursionTree, setRecursionTree] = useState<RecursionNode[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStep, setCurrentStep] = useState("");
  const [finalResult, setFinalResult] = useState<string | null>(null);

  const reverseString = async (
    str: string,
    nodeId: number,
    level: number
  ): Promise<string> => {
    // Add node to recursion tree
    const isBase = str.length <= 1;
    const newNode: RecursionNode = {
      id: nodeId,
      input: str,
      level,
      isActive: true,
      isReturning: false,
      isBaseCase: isBase,
    };

    setRecursionTree((prev) => [...prev, newNode]);
    setCurrentStep(
      `Level ${level}: reverse("${str}")${isBase ? " - Base case!" : ""}`
    );
    await new Promise((resolve) => setTimeout(resolve, 1000 / speed));

    // Base case
    if (str.length <= 1) {
      setCurrentStep(`Base case: "${str}" returns "${str}"`);
      await new Promise((resolve) => setTimeout(resolve, 1000 / speed));

      setRecursionTree((prev) =>
        prev.map((node) =>
          node.id === nodeId
            ? { ...node, output: str, isReturning: true, isActive: false }
            : node
        )
      );
      await new Promise((resolve) => setTimeout(resolve, 800 / speed));

      return str;
    }

    // Recursive case: reverse(rest) + first
    const first = str[0];
    const rest = str.slice(1);

    setCurrentStep(
      `Level ${level}: Split "${str}" into "${first}" + "${rest}"`
    );
    await new Promise((resolve) => setTimeout(resolve, 1000 / speed));

    setCurrentStep(`Level ${level}: Computing reverse("${rest}")`);
    await new Promise((resolve) => setTimeout(resolve, 800 / speed));

    const reversedRest = await reverseString(rest, nodeId + 1, level + 1);

    const result = reversedRest + first;
    setCurrentStep(
      `Level ${level}: "${reversedRest}" + "${first}" = "${result}"`
    );
    await new Promise((resolve) => setTimeout(resolve, 1000 / speed));

    setRecursionTree((prev) =>
      prev.map((node) =>
        node.id === nodeId
          ? { ...node, output: result, isReturning: true, isActive: false }
          : node
      )
    );
    await new Promise((resolve) => setTimeout(resolve, 800 / speed));

    return result;
  };

  const startReversal = async () => {
    if (!inputValue.trim() || inputValue.length > 10) return;

    setIsAnimating(true);
    setRecursionTree([]);
    setFinalResult(null);
    setCurrentStep("");

    const result = await reverseString(inputValue, 0, 0);

    setFinalResult(result);
    setCurrentStep(`Final result: "${result}"`);
    setIsAnimating(false);
  };

  const reset = () => {
    setRecursionTree([]);
    setCurrentStep("");
    setFinalResult(null);
    setIsAnimating(false);
  };

  // Group nodes by level for tree visualization
  const nodesByLevel: { [key: number]: RecursionNode[] } = {};
  recursionTree.forEach((node) => {
    if (!nodesByLevel[node.level]) {
      nodesByLevel[node.level] = [];
    }
    nodesByLevel[node.level].push(node);
  });

  const maxLevel = Math.max(...recursionTree.map((n) => n.level), 0);

  return (
    <div className="h-full flex flex-col p-2 sm:p-0">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-2 text-foreground">
          String Reversal (Recursive) Visualization
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Watch how recursion splits the string and builds the result from base
          cases. Algorithm: reverse(s) = reverse(s[1:]) + s[0]
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 flex-1">
        {/* Controls */}
        <div className="w-full lg:w-80 space-y-4 order-2 lg:order-1">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Enter String (max 10 chars)
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && startReversal()}
                placeholder="Enter text..."
                maxLength={10}
                disabled={isAnimating}
              />
              <Button
                onClick={startReversal}
                disabled={
                  !inputValue.trim() ||
                  isAnimating ||
                  inputValue.length > 10
                }
              >
                <Play className="h-4 w-4 mr-2" />
                Start
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={reset}
              variant="outline"
              disabled={isAnimating}
              className="flex-1"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button
              onClick={() => {
                setInputValue("hello");
                setTimeout(() => {
                  const btn = document.querySelector(
                    'button[disabled=""]'
                  ) as HTMLButtonElement;
                  if (!btn) startReversal();
                }, 100);
              }}
              variant="outline"
              disabled={isAnimating}
              className="flex-1"
            >
              Demo
            </Button>
          </div>

          {currentStep && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">{currentStep}</p>
            </div>
          )}

          {finalResult !== null && (
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Result:</p>
                <p className="text-lg font-mono font-bold text-green-600 dark:text-green-400">
                  &quot;{finalResult}&quot;
                </p>
              </div>
            </div>
          )}

          <div className="pt-4 border-t">
            <div className="text-sm space-y-2">
              <div className="flex items-center justify-between">
                <span>Recursion Depth:</span>
                <Badge variant="secondary">{maxLevel + 1}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Total Calls:</span>
                <Badge variant="secondary">{recursionTree.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Status:</span>
                <Badge variant={isAnimating ? "default" : "outline"}>
                  {isAnimating ? "Computing..." : "Ready"}
                </Badge>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-muted-foreground font-medium">
                  Active Call
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span className="text-muted-foreground font-medium">
                  Base Case
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-600 rounded"></div>
                <span className="text-muted-foreground font-medium">
                  Returning
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Visualization */}
        <div className="flex-1 flex items-center justify-center min-h-[300px] order-1 lg:order-2 overflow-auto">
          {recursionTree.length > 0 ? (
            <div className="p-4 space-y-6">
              <AnimatePresence>
                {Object.keys(nodesByLevel)
                  .map(Number)
                  .sort((a, b) => a - b)
                  .map((level) => (
                    <div key={level} className="space-y-2">
                      <div className="text-xs text-muted-foreground font-medium">
                        Level {level}
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {nodesByLevel[level].map((node) => (
                          <motion.div
                            key={node.id}
                            initial={{ opacity: 0, scale: 0.8, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`
                              relative p-3 rounded-lg border-2 min-w-[200px]
                              ${
                                node.isBaseCase && node.isActive
                                  ? "bg-yellow-500/10 border-yellow-500"
                                  : node.isReturning
                                  ? "bg-green-500/10 border-green-500"
                                  : node.isActive
                                  ? "bg-blue-500/10 border-blue-500"
                                  : "bg-muted border-muted-foreground/20"
                              }
                            `}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <GitBranch className="h-3 w-3" />
                              <span className="text-xs font-medium">
                                Call #{node.id}
                              </span>
                              {node.isBaseCase && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] h-4 px-1 bg-yellow-500/20 border-yellow-500"
                                >
                                  BASE
                                </Badge>
                              )}
                            </div>

                            <div className="space-y-2 text-sm">
                              <div>
                                <div className="text-xs text-muted-foreground mb-1">
                                  Input:
                                </div>
                                <div className="font-mono font-semibold bg-background/50 px-2 py-1 rounded">
                                  &quot;{node.input}&quot;
                                </div>
                              </div>

                              {node.output !== undefined && (
                                <motion.div
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                >
                                  <div className="text-xs text-muted-foreground mb-1">
                                    Returns:
                                  </div>
                                  <div className="font-mono font-bold text-green-600 dark:text-green-400 bg-background/50 px-2 py-1 rounded">
                                    &quot;{node.output}&quot;
                                  </div>
                                </motion.div>
                              )}
                            </div>

                            {node.isActive && (
                              <motion.div
                                className="absolute -top-1 -right-1"
                                animate={{
                                  scale: [1, 1.2, 1],
                                  opacity: [1, 0.7, 1],
                                }}
                                transition={{
                                  duration: 1,
                                  repeat: Infinity,
                                  ease: "easeInOut",
                                }}
                              >
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                              </motion.div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              <GitBranch className="h-12 w-12 mx-auto mb-4 opacity-40" />
              <p className="text-sm sm:text-base font-medium mb-2">
                Enter a string to visualize reversal
              </p>
              <p className="text-xs sm:text-sm opacity-60">
                Watch the recursion tree build and return
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
