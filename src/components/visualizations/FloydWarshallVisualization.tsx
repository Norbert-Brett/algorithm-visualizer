"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, Shuffle } from "lucide-react";

interface FloydWarshallVisualizationProps {
  speed: number;
}

const INF = 999;

export default function FloydWarshallVisualization({ speed }: FloydWarshallVisualizationProps) {
  const [numNodes, setNumNodes] = useState(4);
  const [distMatrix, setDistMatrix] = useState<number[][]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentK, setCurrentK] = useState(-1);
  const [currentI, setCurrentI] = useState(-1);
  const [currentJ, setCurrentJ] = useState(-1);
  const [currentStep, setCurrentStep] = useState("");

  // Initialize graph with adjacency matrix
  const initializeGraph = useCallback(() => {
    const n = 4;
    setNumNodes(n);
    
    // Initialize distance matrix
    const matrix: number[][] = [];
    for (let i = 0; i < n; i++) {
      matrix[i] = [];
      for (let j = 0; j < n; j++) {
        if (i === j) {
          matrix[i][j] = 0;
        } else {
          matrix[i][j] = INF;
        }
      }
    }

    // Add some edges
    const edges = [
      [0, 1, 3],
      [0, 2, 8],
      [1, 2, 1],
      [1, 3, 7],
      [2, 3, 2],
      [3, 0, 4],
    ];
    edges.forEach(([i, j, weight]) => {
      matrix[i][j] = weight;
    });

    setDistMatrix(matrix);
    setCurrentK(-1);
    setCurrentI(-1);
    setCurrentJ(-1);
    setCurrentStep("");
  }, []);

  useEffect(() => {
    initializeGraph();
  }, [initializeGraph]);

  // Floyd-Warshall algorithm
  const runFloydWarshall = useCallback(async () => {
    if (!distMatrix.length || isRunning) return;

    setIsRunning(true);
    setCurrentStep("Starting Floyd-Warshall algorithm");

    // Copy the distance matrix
    const dist = distMatrix.map(row => [...row]);
    const n = dist.length;

    await new Promise(resolve => setTimeout(resolve, Math.max(500, 1000 / speed)));

    // Main algorithm: try each intermediate vertex k
    for (let k = 0; k < n; k++) {
      setCurrentK(k);
      setCurrentStep(`Using vertex ${k} as intermediate vertex`);
      await new Promise(resolve => setTimeout(resolve, Math.max(800, 1600 / speed)));

      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          setCurrentI(i);
          setCurrentJ(j);

          if (i === j) continue;

          const currentDist = dist[i][j];
          const newDist = dist[i][k] + dist[k][j];

          setCurrentStep(
            `Checking path ${i} → ${k} → ${j}: ` +
            `current = ${currentDist === INF ? '∞' : currentDist}, ` +
            `via ${k} = ${newDist >= INF ? '∞' : newDist}`
          );

          await new Promise(resolve => setTimeout(resolve, Math.max(300, 600 / speed)));

          if (newDist < currentDist) {
            dist[i][j] = newDist;
            setDistMatrix(dist.map(row => [...row]));
            setCurrentStep(
              `Updated: dist[${i}][${j}] = ${newDist} (improved via vertex ${k})`
            );
            await new Promise(resolve => setTimeout(resolve, Math.max(500, 1000 / speed)));
          }
        }
      }
    }

    setCurrentK(-1);
    setCurrentI(-1);
    setCurrentJ(-1);
    setCurrentStep("Floyd-Warshall complete! All shortest paths computed.");
    setIsRunning(false);
  }, [distMatrix, isRunning, speed]);

  const generateRandomGraph = () => {
    if (isRunning) return;

    const n = 4;
    setNumNodes(n);

    // Initialize distance matrix
    const matrix: number[][] = [];
    for (let i = 0; i < n; i++) {
      matrix[i] = [];
      for (let j = 0; j < n; j++) {
        if (i === j) {
          matrix[i][j] = 0;
        } else {
          matrix[i][j] = INF;
        }
      }
    }

    // Add random edges (ensure some connectivity)
    for (let i = 0; i < n; i++) {
      // Each node has 1-2 outgoing edges
      const numEdges = Math.floor(Math.random() * 2) + 1;
      for (let e = 0; e < numEdges; e++) {
        const j = Math.floor(Math.random() * n);
        if (i !== j) {
          matrix[i][j] = Math.floor(Math.random() * 9) + 1;
        }
      }
    }

    setDistMatrix(matrix);
    setCurrentK(-1);
    setCurrentI(-1);
    setCurrentJ(-1);
    setCurrentStep("");
  };

  return (
    <div className="h-full flex flex-col p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Floyd-Warshall Algorithm</h2>
        <p className="text-muted-foreground">
          Computes shortest paths between all pairs of vertices using dynamic programming.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Button onClick={runFloydWarshall} disabled={isRunning || !distMatrix.length}>
          <Play className="h-4 w-4 mr-2" />
          Run Algorithm
        </Button>
        <Button onClick={generateRandomGraph} disabled={isRunning} variant="outline">
          <Shuffle className="h-4 w-4 mr-2" />
          Random Graph
        </Button>
        <Button onClick={initializeGraph} disabled={isRunning} variant="outline">
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>

      {/* Visualization */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Status */}
        <div className="text-center mb-4">
          {currentStep && (
            <div className="text-lg font-medium text-blue-600">
              {currentStep}
            </div>
          )}
          {currentK >= 0 && (
            <div className="text-sm text-muted-foreground mt-2">
              Intermediate vertex k = {currentK}
              {currentI >= 0 && currentJ >= 0 && ` | Checking i = ${currentI}, j = ${currentJ}`}
            </div>
          )}
        </div>

        {/* Distance Matrix */}
        <div className="bg-muted/20 rounded-lg p-6 mb-4">
          <h3 className="text-sm font-medium mb-3 text-center">Distance Matrix</h3>
          <div className="inline-block">
            <table className="border-collapse">
              <thead>
                <tr>
                  <th className="w-12 h-12 text-xs font-medium text-muted-foreground"></th>
                  {Array.from({ length: numNodes }).map((_, j) => (
                    <th
                      key={j}
                      className={`w-16 h-12 text-xs font-medium ${
                        j === currentJ || j === currentK ? "text-blue-600" : "text-muted-foreground"
                      }`}
                    >
                      {j}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {distMatrix.map((row, i) => (
                  <tr key={i}>
                    <td
                      className={`w-12 h-16 text-xs font-medium text-center ${
                        i === currentI || i === currentK ? "text-blue-600" : "text-muted-foreground"
                      }`}
                    >
                      {i}
                    </td>
                    {row.map((cell, j) => {
                      const isHighlighted =
                        (i === currentI && j === currentJ) ||
                        (i === currentI && j === currentK) ||
                        (i === currentK && j === currentJ);
                      const isK = i === currentK || j === currentK;

                      return (
                        <td key={j} className="p-0">
                          <motion.div
                            className={`w-16 h-16 flex items-center justify-center text-sm font-medium border ${
                              i === j
                                ? "bg-gray-100 text-gray-400"
                                : isHighlighted
                                ? "bg-yellow-100 text-yellow-900 border-yellow-400"
                                : isK
                                ? "bg-blue-50 text-blue-900 border-blue-300"
                                : "bg-white border-gray-200"
                            }`}
                            animate={{
                              scale: isHighlighted ? 1.05 : 1,
                            }}
                            transition={{ duration: 0.2 }}
                          >
                            {cell === INF ? "∞" : cell}
                          </motion.div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
          {/* Algorithm Explanation */}
          <div className="bg-muted/50 rounded-lg p-3">
            <h3 className="font-medium mb-2 text-sm">How it works:</h3>
            <div className="text-xs space-y-1">
              <div>1. Try each vertex k as intermediate</div>
              <div>2. For each pair (i, j):</div>
              <div className="ml-3">Check if i → k → j is shorter</div>
              <div className="ml-3">Update dist[i][j] if improved</div>
              <div>3. Repeat for all k, i, j</div>
            </div>
          </div>

          {/* Algorithm Properties */}
          <div className="bg-muted/50 rounded-lg p-3">
            <h3 className="font-medium mb-2 text-sm">Properties:</h3>
            <div className="text-xs space-y-1">
              <div>• All-pairs shortest paths</div>
              <div>• Dynamic programming</div>
              <div>• Time: O(V³)</div>
              <div>• Space: O(V²)</div>
              <div>• Works with negative edges</div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <div className="text-sm font-medium mb-2">Legend:</div>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-100 border border-gray-200"></div>
            <span>Diagonal (distance to self)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white border border-gray-200"></div>
            <span>Normal cell</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-50 border border-blue-300"></div>
            <span>Involves intermediate k</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-100 border border-yellow-400"></div>
            <span>Currently checking</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">∞</span>
            <span>No direct path</span>
          </div>
        </div>
      </div>
    </div>
  );
}
