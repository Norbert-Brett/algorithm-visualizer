"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Play, RotateCcw, ArrowDownLeft } from "lucide-react";

interface LCSVisualizationProps {
  speed: number;
}

interface DPCell {
  row: number;
  col: number;
  value: number;
  isActive?: boolean;
  isComputed?: boolean;
  hasArrow?: boolean;
  arrowDirection?: "diagonal" | "up" | "left";
}

export default function LCSVisualization({ speed }: LCSVisualizationProps) {
  const [string1, setString1] = useState("");
  const [string2, setString2] = useState("");
  const [dpTable, setDpTable] = useState<DPCell[][]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStep, setCurrentStep] = useState("");
  const [lcsResult, setLcsResult] = useState("");
  const [tracebackPath, setTracebackPath] = useState<string[]>([]);

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms / speed));

  const computeLCS = async (s1: string, s2: string) => {
    setIsAnimating(true);
    setCurrentStep("Initializing DP table...");
    setLcsResult("");
    setTracebackPath([]);

    const m = s1.length;
    const n = s2.length;

    // Initialize DP table
    const table: DPCell[][] = [];
    const dp: number[][] = [];

    for (let i = 0; i <= m; i++) {
      table[i] = [];
      dp[i] = [];
      for (let j = 0; j <= n; j++) {
        table[i][j] = {
          row: i,
          col: j,
          value: 0,
          isComputed: i === 0 || j === 0,
        };
        dp[i][j] = 0;
      }
    }

    setDpTable([...table]);
    await delay(800);

    // Fill DP table
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        // Highlight current cell
        table[i][j].isActive = true;
        setDpTable([...table]);

        const char1 = s1[i - 1];
        const char2 = s2[j - 1];

        if (char1 === char2) {
          setCurrentStep(
            `Characters match: '${char1}' = '${char2}'. Taking diagonal + 1`
          );
          await delay(700);

          dp[i][j] = dp[i - 1][j - 1] + 1;
          table[i][j].value = dp[i][j];
          table[i][j].arrowDirection = "diagonal";
        } else {
          setCurrentStep(
            `Characters differ: '${char1}' ≠ '${char2}'. Taking max(top, left)`
          );
          await delay(700);

          if (dp[i - 1][j] >= dp[i][j - 1]) {
            dp[i][j] = dp[i - 1][j];
            table[i][j].arrowDirection = "up";
          } else {
            dp[i][j] = dp[i][j - 1];
            table[i][j].arrowDirection = "left";
          }
          table[i][j].value = dp[i][j];
        }

        table[i][j].isComputed = true;
        table[i][j].isActive = false;
        setDpTable([...table]);
        await delay(500);
      }
    }

    // Traceback to find LCS
    setCurrentStep("Tracing back to find LCS...");
    await delay(800);

    const lcs: string[] = [];
    const path: string[] = [];
    let i = m;
    let j = n;

    while (i > 0 && j > 0) {
      path.push(`${i},${j}`);
      table[i][j].hasArrow = true;
      setDpTable([...table]);
      setTracebackPath([...path]);
      await delay(600);

      if (s1[i - 1] === s2[j - 1]) {
        lcs.unshift(s1[i - 1]);
        setLcsResult(lcs.join(""));
        i--;
        j--;
      } else if (i > 0 && j > 0 && dp[i - 1][j] >= dp[i][j - 1]) {
        i--;
      } else {
        j--;
      }
    }

    setCurrentStep(`Complete! LCS = "${lcs.join("")}" (length: ${lcs.length})`);
    setIsAnimating(false);
  };

  const compute = async () => {
    if (!string1.trim() || !string2.trim()) return;
    await computeLCS(string1.trim(), string2.trim());
  };

  const reset = () => {
    setDpTable([]);
    setLcsResult("");
    setTracebackPath([]);
    setCurrentStep("");
    setIsAnimating(false);
  };

  const setExample = (example: "dna" | "words") => {
    if (example === "dna") {
      setString1("AGGTAB");
      setString2("GXTXAYB");
    } else {
      setString1("ABCDGH");
      setString2("AEDFHR");
    }
    reset();
  };

  const getCellKey = (row: number, col: number) => `${row},${col}`;

  return (
    <div className="h-full flex flex-col p-2 sm:p-0">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-2 text-foreground">
          Longest Common Subsequence (LCS)
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Find the longest subsequence common to two strings using dynamic
          programming.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 flex-1">
        {/* Controls */}
        <div className="w-full lg:w-80 space-y-4 order-2 lg:order-1">
          <div className="space-y-2">
            <label className="text-sm font-medium">String 1</label>
            <Input
              type="text"
              value={string1}
              onChange={(e) => setString1(e.target.value.toUpperCase())}
              placeholder="Enter first string..."
              disabled={isAnimating}
              maxLength={12}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">String 2</label>
            <Input
              type="text"
              value={string2}
              onChange={(e) => setString2(e.target.value.toUpperCase())}
              placeholder="Enter second string..."
              disabled={isAnimating}
              maxLength={12}
            />
          </div>

          <Button
            onClick={compute}
            disabled={!string1.trim() || !string2.trim() || isAnimating}
            className="w-full"
          >
            <Play className="h-4 w-4 mr-2" />
            Compute LCS
          </Button>

          <div className="flex gap-2">
            <Button
              onClick={() => setExample("dna")}
              variant="outline"
              disabled={isAnimating}
              className="flex-1"
            >
              DNA Example
            </Button>
            <Button
              onClick={() => setExample("words")}
              variant="outline"
              disabled={isAnimating}
              className="flex-1"
            >
              Word Example
            </Button>
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

          {currentStep && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">{currentStep}</p>
            </div>
          )}

          {lcsResult && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="text-sm font-medium mb-1">
                Longest Common Subsequence:
              </div>
              <Badge variant="default" className="text-base font-mono">
                {lcsResult}
              </Badge>
              <div className="text-xs text-muted-foreground mt-2">
                Length: {lcsResult.length}
              </div>
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
                <span>Computed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded"></div>
                <span>Traceback Path</span>
              </div>
              <div className="flex items-center gap-2">
                <ArrowDownLeft className="h-3 w-3" />
                <span>Match (diagonal)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Visualization */}
        <div className="flex-1 order-1 lg:order-2 overflow-auto">
          {dpTable.length > 0 ? (
            <div className="bg-muted/30 p-4 rounded-lg overflow-x-auto">
              <h3 className="text-sm font-semibold mb-3">DP Table</h3>
              <div className="inline-block">
                {/* Header row with string2 characters */}
                <div className="flex mb-1">
                  <div className="w-12 h-12"></div>
                  <div className="w-12 h-12 flex items-center justify-center font-mono text-xs text-muted-foreground">
                    ε
                  </div>
                  {string2.split("").map((char, idx) => (
                    <div
                      key={idx}
                      className="w-12 h-12 flex items-center justify-center font-mono font-bold"
                    >
                      {char}
                    </div>
                  ))}
                </div>

                {/* Table rows */}
                {dpTable.map((row, i) => (
                  <div key={i} className="flex">
                    {/* Row header with string1 character */}
                    <div className="w-12 h-12 flex items-center justify-center font-mono font-bold">
                      {i === 0 ? (
                        <span className="text-xs text-muted-foreground">ε</span>
                      ) : (
                        string1[i - 1]
                      )}
                    </div>

                    {/* Table cells */}
                    {row.map((cell) => (
                      <motion.div
                        key={`${cell.row}-${cell.col}`}
                        className={`
                          w-12 h-12 border-2 flex items-center justify-center relative
                          transition-colors duration-300
                          ${
                            tracebackPath.includes(getCellKey(cell.row, cell.col))
                              ? "border-purple-500 bg-purple-500/20"
                              : cell.isActive
                              ? "border-blue-500 bg-blue-500/20"
                              : cell.isComputed
                              ? "border-green-600/30 bg-green-600/10"
                              : "border-muted-foreground/20 bg-background"
                          }
                        `}
                        animate={{
                          scale: cell.isActive ? 1.1 : 1,
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <span className="text-sm font-bold">{cell.value}</span>

                        {/* Arrow indicators */}
                        {cell.arrowDirection === "diagonal" && (
                          <ArrowDownLeft className="absolute top-0.5 right-0.5 h-3 w-3 text-green-600" />
                        )}
                        {cell.arrowDirection === "up" && (
                          <div className="absolute top-0.5 right-0.5 text-xs text-muted-foreground">
                            ↑
                          </div>
                        )}
                        {cell.arrowDirection === "left" && (
                          <div className="absolute top-0.5 right-0.5 text-xs text-muted-foreground">
                            ←
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <div className="text-4xl mb-4">📝</div>
                <p className="text-base font-medium mb-2">
                  Enter two strings to compare
                </p>
                <p className="text-sm opacity-60">
                  The algorithm will find their longest common subsequence
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
