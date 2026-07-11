"use client";

import { useState } from "react";
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
  | "pathfinding-grid"
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
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle,_var(--ring)_0%,_transparent_75%)] opacity-10 dark:opacity-5 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[radial-gradient(circle,_var(--ring)_0%,_transparent_75%)] opacity-8 dark:opacity-4 blur-[130px] pointer-events-none z-0" />
      
      <Header />
      
      <div className="flex-1 flex h-[calc(100vh-4rem)] relative z-10">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 dark:bg-black/80 z-40 lg:hidden backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar container */}
        <div className={`
          fixed lg:relative lg:translate-x-0 z-50 lg:z-auto h-full
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

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0 h-full relative">
          <main className="flex-1 p-4 sm:p-6 pb-28 sm:pb-32 overflow-y-auto bg-grid-pattern relative">
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
          </main>
          
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