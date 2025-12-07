"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Play, RotateCcw } from "lucide-react";

interface FibonacciVisualizationProps {
  speed: number;
}

interface MemoCell {
  index: number;
  value: number | null;
  isActive?: boolean;
  isComputed?: boolean;
}

interface CallNode {
  n: number;
  x: number;
  y: number;
  isMemoHit?: boolean;
  isActive?: boolean;
}

export default function FibonacciVisualization({
  speed,
}: FibonacciVisualizationProps) {
  const [n, setN] = useState("");
  const [memoTable, setMemoTable] = useState<MemoCell[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [naiveCalls, setNaiveCalls] = useState(0);
  const [memoizedCalls, setMemoizedCalls] = useState(0);
  const [result, setResult] = useState<number | null>(null);
  const [callTree, setCallTree] = useState<CallNode[]>([]);
  const [currentStep, setCurrentStep] = useState("");

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms / speed));

  // Calculate naive call count (for comparison)
  const calculateNaiveCalls = (num: number): number => {
    if (num <= 1) return 1;
    return 1 + calculateNaiveCalls(num - 1) + calculateNaiveCalls(num - 2);
  };

  // Fibonacci with memoization and visualization
  const fibonacciMemoized = async (
    memo: Map<number, number>,
    num: number,
    depth: number = 0,
    x: number = 0
  ): Promise<number> => {
    setMemoizedCalls((prev) => prev + 1);

    // Check if already computed
    if (memo.has(num)) {
      setCurrentStep(`Memo hit! fib(${num}) = ${memo.get(num)}`);
      
      // Add to call tree as memo hit
      setCallTree((prev) => [
        ...prev,
        { n: num, x, y: depth * 60, isMemoHit: true, isActive: true },
      ]);
      
      await delay(400);
      
      setCallTree((prev) =>
        prev.map((node) =>
          node.n === num && node.y === depth * 60
            ? { ...node, isActive: false }
            : node
        )
      );
      
      return memo.get(num)!;
    }

    // Base case
    if (num <= 1) {
      setCurrentStep(`Base case: fib(${num}) = ${num}`);
      memo.set(num, num);
      
      // Update memo table
      setMemoTable((prev) =>
        prev.map((cell) =>
          cell.index === num
            ? { ...cell, value: num, isActive: true, isComputed: true }
            : { ...cell, isActive: false }
        )
      );
      
      // Add to call tree
      setCallTree((prev) => [
        ...prev,
        { n: num, x, y: depth * 60, isActive: true },
      ]);
      
      await delay(600);
      
      setCallTree((prev) =>
        prev.map((node) =>
          node.n === num && node.y === depth * 60
            ? { ...node, isActive: false }
            : node
        )
      );
      
      return num;
    }

    // Highlight current cell
    setMemoTable((prev) =>
      prev.map((cell) =>
        cell.index === num
          ? { ...cell, isActive: true }
          : { ...cell, isActive: false }
      )
    );

    setCurrentStep(`Computing fib(${num}) = fib(${num - 1}) + fib(${num - 2})`);
    
    // Add to call tree
    setCallTree((prev) => [
      ...prev,
      { n: num, x, y: depth * 60, isActive: true },
    ]);
    
    await delay(600);

    // Recursive calls
    const left = await fibonacciMemoized(memo, num - 1, depth + 1, x - 30);
    const right = await fibonacciMemoized(memo, num - 2, depth + 1, x + 30);
    
    const value = left + right;
    memo.set(num, value);

    // Update memo table with computed value
    setMemoTable((prev) =>
      prev.map((cell) =>
        cell.index === num
          ? { ...cell, value, isActive: true, isComputed: true }
          : cell
      )
    );

    setCurrentStep(`fib(${num}) = ${value} (stored in memo)`);
    
    setCallTree((prev) =>
      prev.map((node) =>
        node.n === num && node.y === depth * 60
          ? { ...node, isActive: false }
          : node
      )
    );
    
    await delay(600);

    return value;
  };

  const computeFibonacci = async () => {
    const num = parseInt(n);
    if (isNaN(num) || num < 0 || num > 20) return;

    setIsAnimating(true);
    setResult(null);
    setNaiveCalls(0);
    setMemoizedCalls(0);
    setCallTree([]);
    setCurrentStep("Initializing...");

    // Initialize memo table
    const table: MemoCell[] = [];
    for (let i = 0; i <= num; i++) {
      table.push({ index: i, value: null });
    }
    setMemoTable(table);

    await delay(500);

    // Calculate naive calls (for comparison)
    const naiveCount = calculateNaiveCalls(num);
    setNaiveCalls(naiveCount);

    // Compute with memoization
    const memo = new Map<number, number>();
    const finalResult = await fibonacciMemoized(memo, num, 0, 0);

    setResult(finalResult);
    setCurrentStep(`Complete! fib(${num}) = ${finalResult}`);
    setIsAnimating(false);
  };

  const reset = () => {
    setMemoTable([]);
    setResult(null);
    setNaiveCalls(0);
    setMemoizedCalls(0);
    setCallTree([]);
    setCurrentStep("");
    setIsAnimating(false);
  };

  return (
    <div className="h-full flex flex-col p-2 sm:p-0">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-2 text-foreground">
          Fibonacci Sequence (Dynamic Programming)
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Visualize how memoization dramatically reduces recursive calls by
          storing computed values.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 flex-1">
        {/* Controls */}
        <div className="w-full lg:w-80 space-y-4 order-2 lg:order-1">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Compute Fibonacci (0-20)
            </label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={n}
                onChange={(e) => setN(e.target.value)}
                placeholder="Enter n..."
                min="0"
                max="20"
                disabled={isAnimating}
              />
              <Button
                onClick={computeFibonacci}
                disabled={!n || isAnimating || parseInt(n) > 20}
              >
                <Play className="h-4 w-4 mr-2" />
                Compute
              </Button>
            </div>
          </div>

          <Button
            onClick={reset}
            variant="outline"
            disabled={isAnimating}
            className="w-full"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>

          {/* Stats */}
          <div className="pt-4 border-t space-y-3">
            <div className="text-sm space-y-2">
              <div className="flex items-center justify-between">
                <span>Naive Calls:</span>
                <Badge variant="destructive">{naiveCalls}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Memoized Calls:</span>
                <Badge variant="default">{memoizedCalls}</Badge>
              </div>
              {result !== null && (
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Result:</span>
                  <Badge variant="secondary" className="text-base">
                    {result}
                  </Badge>
                </div>
              )}
            </div>

            {naiveCalls > 0 && memoizedCalls > 0 && (
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-xs font-medium text-green-700 dark:text-green-400">
                  Speedup: {(naiveCalls / memoizedCalls).toFixed(1)}x faster!
                </p>
              </div>
            )}
          </div>

          {currentStep && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">{currentStep}</p>
            </div>
          )}

          {/* Legend */}
          <div className="pt-4 border-t">
            <div className="text-sm font-medium mb-2">Legend:</div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>Computing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-600 rounded"></div>
                <span>Computed (Memoized)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded"></div>
                <span>Memo Hit (Reused)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Visualization */}
        <div className="flex-1 order-1 lg:order-2 overflow-auto">
          <div className="space-y-4">
            {/* Memoization Table */}
            {memoTable.length > 0 && (
              <div className="bg-muted/30 p-4 rounded-lg">
                <h3 className="text-sm font-semibold mb-3">
                  Memoization Table
                </h3>
                <div className="flex flex-wrap gap-2">
                  {memoTable.map((cell) => (
                    <motion.div
                      key={cell.index}
                      className={`
                        w-16 h-16 rounded-lg border-2 flex flex-col items-center justify-center
                        transition-colors duration-300
                        ${
                          cell.isActive
                            ? "border-blue-500 bg-blue-500/20"
                            : cell.isComputed
                            ? "border-green-600 bg-green-600/20"
                            : "border-muted-foreground/20 bg-background"
                        }
                      `}
                      animate={{
                        scale: cell.isActive ? 1.1 : 1,
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="text-xs text-muted-foreground">
                        f({cell.index})
                      </div>
                      <div className="text-sm font-bold">
                        {cell.value !== null ? cell.value : "?"}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Call Tree Visualization */}
            {callTree.length > 0 && (
              <div className="bg-muted/30 p-4 rounded-lg">
                <h3 className="text-sm font-semibold mb-3">
                  Recursion Tree (Recent Calls)
                </h3>
                <div className="relative min-h-[200px] overflow-x-auto">
                  <svg
                    className="w-full"
                    viewBox="-150 -20 300 250"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    {callTree.slice(-15).map((node, idx) => (
                      <g key={idx}>
                        <motion.circle
                          cx={node.x}
                          cy={node.y}
                          r="15"
                          className={
                            node.isMemoHit
                              ? "fill-purple-500"
                              : node.isActive
                              ? "fill-blue-500"
                              : "fill-green-600"
                          }
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.3 }}
                        />
                        <text
                          x={node.x}
                          y={node.y}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="fill-white text-xs font-semibold"
                        >
                          {node.n}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
