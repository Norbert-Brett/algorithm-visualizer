"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Header from "./Header";
import Sidebar from "./Sidebar";
import VisualizationArea from "./VisualizationArea";
import ControlPanel from "./ControlPanel";

export type Algorithm = 
  // Basic Data Structures
  | "stack" 
  | "queue"
  // Tree Data Structures
  | "bst" 
  | "avl-tree"
  | "red-black-tree"
  | "splay-tree"
  | "btree"
  | "b-plus-tree"
  | "trie"
  | "radix-tree"
  | "ternary-search-tree"
  // Hash Tables
  | "open-hash-table"
  | "closed-hash-table"
  | "bucket-hash-table"
  // Heap Data Structures
  | "heap"
  | "binomial-queue"
  | "fibonacci-heap"
  | "leftist-heap"
  | "skew-heap"
  // Search Algorithms
  | "linear-search"
  | "binary-search"
  | "binary-search-sorted"
  // Sorting Algorithms
  | "bubble-sort" 
  | "selection-sort"
  | "insertion-sort"
  | "shell-sort"
  | "merge-sort"
  | "quick-sort"
  | "heap-sort" 
  | "bucket-sort"
  | "counting-sort"
  | "radix-sort"
  // Graph Algorithms
  | "dfs"
  | "bfs"
  | "connected-components"
  | "dijkstra"
  | "prim-mst"
  | "kruskal"
  | "topological-sort-indegree"
  | "topological-sort-dfs"
  | "floyd-warshall"
  // Dynamic Programming
  | "fibonacci"
  | "making-change"
  | "longest-common-subsequence"
  | "knapsack"
  // Recursion & Backtracking
  | "recursion-factorial"
  | "string-reversal"
  | "n-queens"
  // Geometric Algorithms
  | "2d-rotation-scale"
  | "2d-rotation-translation"
  | "2d-coordinate-systems"
  | "3d-rotation-scale"
  | "3d-coordinate-systems"
  // Advanced Data Structures
  | "disjoint-sets"
  // Miscellaneous
  | "shuffle"
  | "indexing";

export default function AlgorithmVisualizer() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<Algorithm>("stack");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex h-[calc(100vh-4rem)] relative">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <div className={`
          fixed lg:relative lg:translate-x-0 z-50 lg:z-auto
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:block
        `}>
          <Sidebar 
            selectedAlgorithm={selectedAlgorithm}
            onAlgorithmSelect={(algorithm) => {
              setSelectedAlgorithm(algorithm);
              setSidebarOpen(false); // Close sidebar on mobile after selection
            }}
            onClose={() => setSidebarOpen(false)}
          />
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 p-3 sm:p-6 bg-muted/30">
            <Card className="h-full shadow-sm">
              <VisualizationArea 
                algorithm={selectedAlgorithm}
                isPlaying={isPlaying}
                speed={speed}
                resetTrigger={resetTrigger}
                onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                onAnimationStateChange={(animating) => {
                  console.log('AlgorithmVisualizer: animation state changed to', animating);
                  setIsAnimating(animating);
                  if (animating) {
                    console.log('Setting isPlaying to true');
                    setIsPlaying(true);
                  }
                }}
              />
            </Card>
          </main>
          <Separator />
          <ControlPanel 
            isPlaying={isPlaying}
            isAnimating={isAnimating}
            onPlayPause={() => {
              console.log('Play/Pause clicked, current isPlaying:', isPlaying);
              setIsPlaying(!isPlaying);
            }}
            onStop={() => {
              setIsPlaying(false);
              setIsAnimating(false);
              setResetTrigger(prev => prev + 1);
            }}
            onReset={() => {
              setIsAnimating(false);
              setResetTrigger(prev => prev + 1);
            }}
            speed={speed}
            onSpeedChange={setSpeed}
            algorithm={selectedAlgorithm}
          />
        </div>
      </div>
    </div>
  );
}