"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, Trash2, Sparkles, HelpCircle } from "lucide-react";
import { toast } from "sonner";

interface PathfindingGridVisualizationProps {
  speed: number;
  isPlaying: boolean;
  resetTrigger: number;
  onAnimationStateChange?: (isAnimating: boolean) => void;
}

type CellType = "empty" | "wall" | "start" | "end" | "visited" | "shortest-path" | "exploring";

interface Cell {
  row: number;
  col: number;
  type: CellType;
  distance: number;
  heuristic: number;
  totalCost: number;
  isVisited: boolean;
  previousCell: Cell | null;
}

const ROWS = 12;
const COLS = 22;
const START_ROW = 5;
const START_COL = 3;
const END_ROW = 5;
const END_COL = 18;

export default function PathfindingGridVisualization({
  speed,
  isPlaying,
  resetTrigger,
  onAnimationStateChange,
}: PathfindingGridVisualizationProps) {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [startNode, setStartNode] = useState({ row: START_ROW, col: START_COL });
  const [endNode, setEndNode] = useState({ row: END_ROW, col: END_COL });
  const [algorithm, setAlgorithm] = useState<"dijkstra" | "astar">("astar");
  const [isMousePressed, setIsMousePressed] = useState(false);
  const [draggingNode, setDraggingNode] = useState<"start" | "end" | null>(null);
  const [isAnimatingLocal, setIsAnimatingLocal] = useState(false);
  const [runningInstance, setRunningInstance] = useState<{ active: boolean }>({ active: false });

  // Refs for tracking drag status across closures
  const gridStateRef = useRef({ grid, startNode, endNode, isAnimatingLocal });
  useEffect(() => {
    gridStateRef.current = { grid, startNode, endNode, isAnimatingLocal };
  }, [grid, startNode, endNode, isAnimatingLocal]);

  // Create initial grid structure
  const createInitialGrid = useCallback((sNode = startNode, eNode = endNode) => {
    const initialGrid: Cell[][] = [];
    for (let r = 0; r < ROWS; r++) {
      const currentRow: Cell[] = [];
      for (let c = 0; c < COLS; c++) {
        let type: CellType = "empty";
        if (r === sNode.row && c === sNode.col) type = "start";
        else if (r === eNode.row && c === eNode.col) type = "end";

        currentRow.push({
          row: r,
          col: c,
          type,
          distance: Infinity,
          heuristic: Infinity,
          totalCost: Infinity,
          isVisited: false,
          previousCell: null,
        });
      }
      initialGrid.push(currentRow);
    }
    return initialGrid;
  }, [startNode, endNode]);

  // Initialize
  useEffect(() => {
    setGrid(createInitialGrid());
  }, [createInitialGrid]);

  // Reset grid but keep walls
  const clearPath = useCallback(() => {
    setGrid((prevGrid) =>
      prevGrid.map((row) =>
        row.map((cell) => {
          if (cell.type === "visited" || cell.type === "shortest-path" || cell.type === "exploring") {
            return {
              ...cell,
              type: "empty",
              distance: Infinity,
              heuristic: Infinity,
              totalCost: Infinity,
              isVisited: false,
              previousCell: null,
            };
          }
          return {
            ...cell,
            distance: Infinity,
            heuristic: Infinity,
            totalCost: Infinity,
            isVisited: false,
            previousCell: null,
          };
        })
      )
    );
  }, []);

  // Fully reset grid
  const resetGrid = useCallback(() => {
    setStartNode({ row: START_ROW, col: START_COL });
    setEndNode({ row: END_ROW, col: END_COL });
    setGrid(createInitialGrid({ row: START_ROW, col: START_COL }, { row: END_ROW, col: END_COL }));
    setIsAnimatingLocal(false);
    onAnimationStateChange?.(false);
    runningInstance.active = false;
  }, [createInitialGrid, onAnimationStateChange, runningInstance]);

  // Listen to outer reset triggers
  useEffect(() => {
    if (resetTrigger > 0) {
      resetGrid();
    }
  }, [resetTrigger, resetGrid]);

  // Handle cell click and drags
  const handleMouseDown = (row: number, col: number) => {
    if (isAnimatingLocal) return;
    const cell = grid[row][col];
    if (cell.type === "start") {
      setDraggingNode("start");
    } else if (cell.type === "end") {
      setDraggingNode("end");
    } else {
      setIsMousePressed(true);
      toggleWall(row, col);
    }
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (isAnimatingLocal) return;
    if (draggingNode === "start") {
      if (grid[row][col].type !== "wall" && grid[row][col].type !== "end") {
        moveStartOrEndNode("start", row, col);
      }
    } else if (draggingNode === "end") {
      if (grid[row][col].type !== "wall" && grid[row][col].type !== "start") {
        moveStartOrEndNode("end", row, col);
      }
    } else if (isMousePressed) {
      toggleWall(row, col);
    }
  };

  const handleMouseUp = () => {
    setIsMousePressed(false);
    setDraggingNode(null);
  };

  const toggleWall = (row: number, col: number) => {
    const cell = grid[row][col];
    if (cell.type === "start" || cell.type === "end") return;

    setGrid((prevGrid) =>
      prevGrid.map((r, ri) =>
        r.map((c, ci) => {
          if (ri === row && ci === col) {
            return {
              ...c,
              type: c.type === "wall" ? "empty" : "wall",
            };
          }
          return c;
        })
      )
    );
  };

  const moveStartOrEndNode = (nodeType: "start" | "end", row: number, col: number) => {
    if (nodeType === "start") {
      setStartNode({ row, col });
      setGrid((prevGrid) =>
        prevGrid.map((r, ri) =>
          r.map((c, ci) => {
            if (c.type === "start") return { ...c, type: "empty" };
            if (ri === row && ci === col) return { ...c, type: "start" };
            return c;
          })
        )
      );
    } else {
      setEndNode({ row, col });
      setGrid((prevGrid) =>
        prevGrid.map((r, ri) =>
          r.map((c, ci) => {
            if (c.type === "end") return { ...c, type: "empty" };
            if (ri === row && ci === col) return { ...c, type: "end" };
            return c;
          })
        )
      );
    }
  };

  const generateMaze = () => {
    if (isAnimatingLocal) return;
    clearPath();
    const newGrid = createInitialGrid();
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        // Random obstacles but keep start/end free
        if (
          Math.random() < 0.28 &&
          !(r === startNode.row && c === startNode.col) &&
          !(r === endNode.row && c === endNode.col)
        ) {
          newGrid[r][c].type = "wall";
        }
      }
    }
    setGrid(newGrid);
    toast.success("Random obstacles generated!");
  };

  // Helper delay supporting variable speeds
  const stepDelay = async () => {
    const baseDelay = 55;
    await new Promise((resolve) => setTimeout(resolve, baseDelay / speed));
  };

  // Manhattan Heuristic
  const getManhattanDistance = (nodeA: { row: number; col: number }, nodeB: { row: number; col: number }) => {
    return Math.abs(nodeA.row - nodeB.row) + Math.abs(nodeA.col - nodeB.col);
  };

  // Get unvisited neighbors
  const getNeighbors = (cell: Cell, currentGrid: Cell[][]) => {
    const neighbors: Cell[] = [];
    const { row, col } = cell;

    if (row > 0) neighbors.push(currentGrid[row - 1][col]);
    if (row < ROWS - 1) neighbors.push(currentGrid[row + 1][col]);
    if (col > 0) neighbors.push(currentGrid[row][col - 1]);
    if (col < COLS - 1) neighbors.push(currentGrid[row][col + 1]);

    return neighbors.filter((n) => n.type !== "wall" && !n.isVisited);
  };

  // Trigger search execution
  const runPathfinding = async () => {
    if (isAnimatingLocal) return;
    clearPath();
    setIsAnimatingLocal(true);
    onAnimationStateChange?.(true);

    const activeInstance = { active: true };
    setRunningInstance(activeInstance);

    // Capture grid snapshot
    const workingGrid = gridStateRef.current.grid.map((row) =>
      row.map((cell) => ({
        ...cell,
        distance: cell.type === "start" ? 0 : Infinity,
        totalCost: cell.type === "start" ? 0 : Infinity,
        isVisited: false,
        previousCell: null,
      }))
    );

    const sNode = workingGrid[startNode.row][startNode.col];
    const eNode = workingGrid[endNode.row][endNode.col];

    const openList: Cell[] = [sNode];
    const visitedNodesInOrder: Cell[] = [];
    let targetFound = false;

    // Dijkstra & A* execution loop
    while (openList.length > 0 && activeInstance.active) {
      // Sort open list
      if (algorithm === "astar") {
        // A* sorts by total cost (f = g + h)
        openList.sort((a, b) => a.totalCost - b.totalCost || a.heuristic - b.heuristic);
      } else {
        // Dijkstra sorts by distance from start
        openList.sort((a, b) => a.distance - b.distance);
      }

      const currentCell = openList.shift();
      if (!currentCell) break;

      // Skip wall cells or already visited
      if (currentCell.type === "wall") continue;
      currentCell.isVisited = true;
      visitedNodesInOrder.push(currentCell);

      // Reached End Node
      if (currentCell.row === eNode.row && currentCell.col === eNode.col) {
        targetFound = true;
        break;
      }

      // Mark cell rendering exploration state
      if (currentCell.type !== "start" && currentCell.type !== "end") {
        currentCell.type = "exploring";
        setGrid(workingGrid.map((r) => r.map((c) => ({ ...c }))));
        await stepDelay();
      }

      // Process neighbors
      const neighbors = getNeighbors(currentCell, workingGrid);
      for (const neighbor of neighbors) {
        const tentativeDistance = currentCell.distance + 1;
        
        if (tentativeDistance < neighbor.distance) {
          neighbor.distance = tentativeDistance;
          neighbor.previousCell = currentCell;

          if (algorithm === "astar") {
            neighbor.heuristic = getManhattanDistance(neighbor, endNode);
            neighbor.totalCost = neighbor.distance + neighbor.heuristic;
          } else {
            neighbor.totalCost = neighbor.distance;
          }

          if (!openList.some((node) => node.row === neighbor.row && node.col === neighbor.col)) {
            openList.push(neighbor);
            if (neighbor.type !== "end") {
              neighbor.type = "exploring";
            }
          }
        }
      }

      if (currentCell.type !== "start" && currentCell.type !== "end") {
        currentCell.type = "visited";
      }
    }

    if (!activeInstance.active) return;

    if (targetFound) {
      // Animate Shortest Path
      const shortestPath: Cell[] = [];
      let current: Cell | null = workingGrid[endNode.row][endNode.col];
      while (current !== null) {
        shortestPath.unshift(current);
        current = current.previousCell;
      }

      // Render trace path step-by-step
      for (const pathCell of shortestPath) {
        if (!activeInstance.active) return;
        if (pathCell.type !== "start" && pathCell.type !== "end") {
          pathCell.type = "shortest-path";
          setGrid(workingGrid.map((r) => r.map((c) => ({ ...c }))));
          await stepDelay();
        }
      }
      toast.success(`Target found! Visited ${visitedNodesInOrder.length} nodes.`);
    } else if (activeInstance.active) {
      toast.error("No path could be found to the end node!");
    }

    setIsAnimatingLocal(false);
    onAnimationStateChange?.(false);
  };

  // Sync isPlaying trigger from ControlPanel
  useEffect(() => {
    if (isPlaying && !isAnimatingLocal) {
      runPathfinding();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]);

  return (
    <div className="h-full flex flex-col p-2 sm:p-0" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-1.5 text-foreground">Pathfinding Grid Visualizer</h2>
        <p className="text-sm text-muted-foreground font-sans">
          Visualize search patterns on a grid map. Click and drag to draw walls or move start/target anchors.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 lg:gap-6 flex-1 h-full min-h-0">
        
        {/* Settings Control Card */}
        <div className="w-full lg:w-80 space-y-4 order-2 lg:order-1 flex-shrink-0">
          <div className="glass p-4 rounded-xl space-y-4 border border-border/40">
            <div>
              <label className="text-[10px] font-mono font-semibold tracking-wider text-muted-foreground uppercase">Select Search Method</label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Button
                  variant={algorithm === "astar" ? "default" : "outline"}
                  onClick={() => !isAnimatingLocal && setAlgorithm("astar")}
                  disabled={isAnimatingLocal}
                  className="text-xs font-semibold h-9 active:scale-95 transition-all"
                >
                  A* Search
                </Button>
                <Button
                  variant={algorithm === "dijkstra" ? "default" : "outline"}
                  onClick={() => !isAnimatingLocal && setAlgorithm("dijkstra")}
                  disabled={isAnimatingLocal}
                  className="text-xs font-semibold h-9 active:scale-95 transition-all"
                >
                  Dijkstra
                </Button>
              </div>
            </div>

            <div className="pt-2 border-t border-border/40 space-y-2">
              <Button
                onClick={generateMaze}
                disabled={isAnimatingLocal}
                variant="outline"
                className="w-full text-xs font-semibold h-9 active:scale-95 transition-all"
              >
                <Sparkles className="h-4 w-4 mr-2 text-amber-500" />
                Randomize Maze
              </Button>
              <Button
                onClick={clearPath}
                disabled={isAnimatingLocal}
                variant="outline"
                className="w-full text-xs font-semibold h-9 active:scale-95 transition-all"
              >
                <Trash2 className="h-4 w-4 mr-2 text-muted-foreground" />
                Clear Path Trace
              </Button>
              <Button
                onClick={resetGrid}
                variant="outline"
                className="w-full text-xs font-semibold h-9 text-destructive border-destructive/20 hover:bg-destructive/10 active:scale-95 transition-all"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Board
              </Button>
            </div>
          </div>

          {/* Quick Help Guide */}
          <div className="p-4 rounded-xl border border-border/40 bg-muted/20 text-xs text-muted-foreground space-y-2.5 font-sans">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <HelpCircle className="h-4 w-4 text-accent" />
              <span>Interactive Guide</span>
            </div>
            <ul className="space-y-1.5 list-disc pl-4">
              <li>Drag <span className="text-emerald-500 font-bold">Start (S)</span> and <span className="text-red-500 font-bold">End (E)</span> to position them.</li>
              <li>Click & drag empty cells to draw **Walls**.</li>
              <li>Dijkstra visualizes unweighted BFS expansion.</li>
              <li>A* uses heuristics to prioritize cells closer to destination.</li>
            </ul>
          </div>
        </div>

        {/* Dynamic Grid Canvas */}
        <div className="flex-1 min-h-[340px] order-1 lg:order-2 flex items-center justify-center p-3 rounded-2xl border border-border/50 bg-card/40 relative overflow-x-auto custom-scrollbar">
          <div className="grid gap-[1px] bg-border/20 p-2 rounded-xl border border-border/40 select-none shadow-sm min-w-max"
               style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}>
            {grid.map((row, r) =>
              row.map((cell, c) => {
                let cellClass = "bg-background/80 hover:bg-muted/40";
                let textValue = "";

                if (cell.type === "start") {
                  cellClass = "bg-emerald-500 text-white font-bold font-mono text-center flex items-center justify-center shadow-lg shadow-emerald-500/20 cursor-grab active:cursor-grabbing scale-102 ring-2 ring-emerald-500 ring-offset-1 z-10";
                  textValue = "S";
                } else if (cell.type === "end") {
                  cellClass = "bg-red-500 text-white font-bold font-mono text-center flex items-center justify-center shadow-lg shadow-red-500/20 cursor-grab active:cursor-grabbing scale-102 ring-2 ring-red-500 ring-offset-1 z-10";
                  textValue = "E";
                } else if (cell.type === "wall") {
                  cellClass = "bg-foreground/80 border border-foreground/20 scale-95 rounded-xs transition-transform duration-100 z-5";
                } else if (cell.type === "exploring") {
                  cellClass = "bg-amber-500/25 border border-amber-500/35 transition-all scale-95 duration-75 animate-pulse z-1";
                } else if (cell.type === "visited") {
                  cellClass = "bg-accent/15 border border-accent/25 transition-all duration-150";
                } else if (cell.type === "shortest-path") {
                  cellClass = "bg-accent text-accent-foreground font-semibold flex items-center justify-center shadow-md shadow-accent/20 scale-98 border border-accent/40 rounded-sm z-5 animate-pulse";
                }

                return (
                  <div
                    key={`${r}-${c}`}
                    onMouseDown={() => handleMouseDown(r, c)}
                    onMouseEnter={() => handleMouseEnter(r, c)}
                    className={`
                      w-6 h-6 sm:w-7 sm:h-7 rounded-xs text-[10px] sm:text-xs select-none transition-all duration-150 cursor-pointer
                      ${cellClass}
                    `}
                  >
                    {textValue}
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
