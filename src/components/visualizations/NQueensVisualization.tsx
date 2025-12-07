"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Crown,
} from "lucide-react";

interface NQueensVisualizationProps {
  speed: number;
}

interface BoardState {
  queens: number[]; // queens[i] = column position of queen in row i
  attackedSquares: Set<string>;
}

export default function NQueensVisualization({
  speed,
}: NQueensVisualizationProps) {
  const [n, setN] = useState("8");
  const [solutions, setSolutions] = useState<number[][]>([]);
  const [currentSolutionIndex, setCurrentSolutionIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentBoard, setCurrentBoard] = useState<BoardState | null>(null);
  const [currentStep, setCurrentStep] = useState("");
  const [backtrackCount, setBacktrackCount] = useState(0);

  const isAttacked = (
    queens: number[],
    row: number,
    col: number
  ): boolean => {
    for (let i = 0; i < row; i++) {
      const queenCol = queens[i];
      // Check column
      if (queenCol === col) return true;
      // Check diagonals
      if (Math.abs(i - row) === Math.abs(queenCol - col)) return true;
    }
    return false;
  };

  const getAttackedSquares = (queens: number[], boardSize: number): Set<string> => {
    const attacked = new Set<string>();

    queens.forEach((col, row) => {
      if (col === -1) return;

      // Mark all squares in the same column
      for (let r = 0; r < boardSize; r++) {
        attacked.add(`${r},${col}`);
      }

      // Mark all squares in diagonals
      for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
          if (Math.abs(i - row) === Math.abs(j - col)) {
            attacked.add(`${i},${j}`);
          }
        }
      }
    });

    return attacked;
  };

  const solveNQueens = async (
    row: number,
    queens: number[],
    boardSize: number,
    allSolutions: number[][]
  ): Promise<void> => {
    if (row === boardSize) {
      // Found a solution
      allSolutions.push([...queens]);
      setCurrentStep(`✓ Solution #${allSolutions.length} found!`);
      const attackedSquares = getAttackedSquares(queens, boardSize);
      setCurrentBoard({ queens: [...queens], attackedSquares });
      await new Promise((resolve) => setTimeout(resolve, 1500 / speed));
      return;
    }

    for (let col = 0; col < boardSize; col++) {
      if (!isAttacked(queens, row, col)) {
        // Place queen
        queens[row] = col;
        const attackedSquares = getAttackedSquares(queens, boardSize);
        setCurrentBoard({ queens: [...queens], attackedSquares });
        setCurrentStep(`Placing queen at row ${row}, col ${col}`);
        await new Promise((resolve) => setTimeout(resolve, 800 / speed));

        // Recurse
        await solveNQueens(row + 1, queens, boardSize, allSolutions);

        // Backtrack
        queens[row] = -1;
        setBacktrackCount((prev) => prev + 1);
        setCurrentStep(`Backtracking from row ${row}, col ${col}`);
        const newAttackedSquares = getAttackedSquares(queens, boardSize);
        setCurrentBoard({ queens: [...queens], attackedSquares: newAttackedSquares });
        await new Promise((resolve) => setTimeout(resolve, 600 / speed));
      }
    }
  };

  const startSolving = async () => {
    const boardSize = parseInt(n);
    if (isNaN(boardSize) || boardSize < 4 || boardSize > 8) return;

    setIsAnimating(true);
    setSolutions([]);
    setCurrentSolutionIndex(0);
    setCurrentBoard(null);
    setCurrentStep("");
    setBacktrackCount(0);

    const allSolutions: number[][] = [];
    const queens = new Array(boardSize).fill(-1);

    await solveNQueens(0, queens, boardSize, allSolutions);

    setSolutions(allSolutions);
    setCurrentStep(
      `Complete! Found ${allSolutions.length} solution${
        allSolutions.length !== 1 ? "s" : ""
      }`
    );

    if (allSolutions.length > 0) {
      const attackedSquares = getAttackedSquares(
        allSolutions[0],
        boardSize
      );
      setCurrentBoard({ queens: allSolutions[0], attackedSquares });
    }

    setIsAnimating(false);
  };

  const reset = () => {
    setSolutions([]);
    setCurrentSolutionIndex(0);
    setCurrentBoard(null);
    setCurrentStep("");
    setBacktrackCount(0);
    setIsAnimating(false);
  };

  const showSolution = (index: number) => {
    if (index >= 0 && index < solutions.length) {
      setCurrentSolutionIndex(index);
      const boardSize = parseInt(n);
      const attackedSquares = getAttackedSquares(solutions[index], boardSize);
      setCurrentBoard({ queens: solutions[index], attackedSquares });
    }
  };

  const boardSize = parseInt(n) || 8;
  const cellSize = Math.min(50, 400 / boardSize);

  return (
    <div className="h-full flex flex-col p-2 sm:p-0">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-2 text-foreground">
          N-Queens Problem Visualization
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Place N queens on an N×N chessboard so no two queens attack each
          other. Watch backtracking in action!
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 flex-1">
        {/* Controls */}
        <div className="w-full lg:w-80 space-y-4 order-2 lg:order-1">
          <div className="space-y-2">
            <label className="text-sm font-medium">Board Size (4-8)</label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={n}
                onChange={(e) => setN(e.target.value)}
                placeholder="Enter N..."
                min="4"
                max="8"
                disabled={isAnimating}
              />
              <Button
                onClick={startSolving}
                disabled={
                  isAnimating ||
                  parseInt(n) < 4 ||
                  parseInt(n) > 8 ||
                  isNaN(parseInt(n))
                }
              >
                <Play className="h-4 w-4 mr-2" />
                Solve
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

          {currentStep && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">{currentStep}</p>
            </div>
          )}

          {solutions.length > 0 && !isAnimating && (
            <div className="space-y-3">
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                  Found {solutions.length} solution
                  {solutions.length !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Navigate Solutions
                </label>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => showSolution(currentSolutionIndex - 1)}
                    disabled={currentSolutionIndex === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex-1 text-center">
                    <Badge variant="secondary">
                      {currentSolutionIndex + 1} / {solutions.length}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => showSolution(currentSolutionIndex + 1)}
                    disabled={currentSolutionIndex === solutions.length - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 border-t">
            <div className="text-sm space-y-2">
              <div className="flex items-center justify-between">
                <span>Board Size:</span>
                <Badge variant="secondary">{boardSize}×{boardSize}</Badge>
              </div>
              {backtrackCount > 0 && (
                <div className="flex items-center justify-between">
                  <span>Backtracks:</span>
                  <Badge variant="secondary">{backtrackCount}</Badge>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span>Status:</span>
                <Badge variant={isAnimating ? "default" : "outline"}>
                  {isAnimating ? "Solving..." : "Ready"}
                </Badge>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <Crown className="h-3 w-3 text-yellow-600" />
                <span className="text-muted-foreground font-medium">
                  Queen
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500/30 rounded"></div>
                <span className="text-muted-foreground font-medium">
                  Attacked Square
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-muted rounded"></div>
                <span className="text-muted-foreground font-medium">
                  Safe Square
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Visualization */}
        <div className="flex-1 flex items-center justify-center min-h-[300px] order-1 lg:order-2 overflow-auto p-4">
          {currentBoard ? (
            <div className="inline-block">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSolutionIndex}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="border-2 border-muted-foreground/20 rounded-lg overflow-hidden"
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${boardSize}, ${cellSize}px)`,
                    gridTemplateRows: `repeat(${boardSize}, ${cellSize}px)`,
                  }}
                >
                  {Array.from({ length: boardSize * boardSize }).map(
                    (_, index) => {
                      const row = Math.floor(index / boardSize);
                      const col = index % boardSize;
                      const isLight = (row + col) % 2 === 0;
                      const hasQueen =
                        currentBoard.queens[row] === col &&
                        currentBoard.queens[row] !== -1;
                      const isAttacked = currentBoard.attackedSquares.has(
                        `${row},${col}`
                      );

                      return (
                        <motion.div
                          key={`${row}-${col}`}
                          className={`
                            flex items-center justify-center relative
                            ${
                              isLight
                                ? "bg-slate-200 dark:bg-slate-700"
                                : "bg-slate-300 dark:bg-slate-600"
                            }
                            ${
                              isAttacked && !hasQueen
                                ? "bg-red-500/30 dark:bg-red-500/20"
                                : ""
                            }
                          `}
                          style={{
                            width: `${cellSize}px`,
                            height: `${cellSize}px`,
                          }}
                        >
                          {hasQueen && (
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{
                                type: "spring",
                                stiffness: 200,
                                damping: 15,
                              }}
                            >
                              <Crown
                                className="text-yellow-600 dark:text-yellow-400"
                                style={{
                                  width: `${cellSize * 0.6}px`,
                                  height: `${cellSize * 0.6}px`,
                                }}
                              />
                            </motion.div>
                          )}
                        </motion.div>
                      );
                    }
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              <Crown className="h-12 w-12 mx-auto mb-4 opacity-40" />
              <p className="text-sm sm:text-base font-medium mb-2">
                Enter board size to solve N-Queens
              </p>
              <p className="text-xs sm:text-sm opacity-60">
                Watch backtracking find all solutions
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
