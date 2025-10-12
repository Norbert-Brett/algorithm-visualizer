"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Header from "./Header";
import Sidebar from "./Sidebar";
import VisualizationArea from "./VisualizationArea";
import ControlPanel from "./ControlPanel";

export type Algorithm = 
  // Data Structures
  | "stack" 
  | "queue" 
  | "bst" 
  | "btree"
  // Sorting Algorithms
  | "bubble-sort" 
  | "selection-sort" 
  | "merge-sort" 
  | "heap-sort" 
  | "radix-sort"
  // Search Algorithms
  | "linear-search"
  | "binary-search"
  | "dfs"
  | "bfs"
  // Graph Algorithms
  | "dijkstra"
  | "a-star"
  | "kruskal"
  // Dynamic Programming
  | "fibonacci"
  | "knapsack"
  // Miscellaneous
  | "shuffle";

export default function AlgorithmVisualizer() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<Algorithm>("stack");
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
                onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
              />
            </Card>
          </main>
          <Separator />
          <ControlPanel 
            isPlaying={isPlaying}
            onPlayPause={() => setIsPlaying(!isPlaying)}
            speed={speed}
            onSpeedChange={setSpeed}
            algorithm={selectedAlgorithm}
          />
        </div>
      </div>
    </div>
  );
}