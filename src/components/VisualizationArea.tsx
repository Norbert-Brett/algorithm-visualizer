"use client";

import { Algorithm } from "./AlgorithmVisualizer";
import { Button } from "./ui/button";
import { Menu } from "lucide-react";
import StackVisualization from "./visualizations/StackVisualization";
import QueueVisualization from "./visualizations/QueueVisualization";
import BSTVisualization from "./visualizations/BSTVisualization";
import BTreeVisualization from "./visualizations/BTreeVisualization";
import BubbleSortVisualization from "./visualizations/BubbleSortVisualization";
import SelectionSortVisualization from "./visualizations/SelectionSortVisualization";
import MergeSortVisualization from "./visualizations/MergeSortVisualization";
import HeapSortVisualization from "./visualizations/HeapSortVisualization";
import RadixSortVisualization from "./visualizations/RadixSortVisualization";
import LinearSearchVisualization from "./visualizations/LinearSearchVisualization";
import BinarySearchVisualization from "./visualizations/BinarySearchVisualization";
import DFSVisualization from "./visualizations/DFSVisualization";
import BFSVisualization from "./visualizations/BFSVisualization";

interface VisualizationAreaProps {
  algorithm: Algorithm;
  isPlaying: boolean;
  speed: number;
  onToggleSidebar?: () => void;
}

// Placeholder component for algorithms not yet implemented
const ComingSoonVisualization = ({ algorithmName }: { algorithmName: string }) => (
  <div className="flex items-center justify-center h-full">
    <div className="text-center">
      <div className="text-6xl mb-4">🚧</div>
      <h3 className="text-xl font-semibold mb-2">{algorithmName}</h3>
      <p className="text-muted-foreground">Coming Soon!</p>
      <p className="text-sm text-muted-foreground mt-2">
        This visualization is under development
      </p>
    </div>
  </div>
);

export default function VisualizationArea({ algorithm, isPlaying, speed, onToggleSidebar }: VisualizationAreaProps) {
  const renderVisualization = () => {
    switch (algorithm) {
      // Data Structures
      case "stack":
        return <StackVisualization isPlaying={isPlaying} speed={speed} />;
      case "queue":
        return <QueueVisualization isPlaying={isPlaying} speed={speed} />;
      case "bst":
        return <BSTVisualization isPlaying={isPlaying} speed={speed} />;
      case "btree":
        return <BTreeVisualization isPlaying={isPlaying} speed={speed} />;
      
      // Sorting Algorithms
      case "bubble-sort":
        return <BubbleSortVisualization isPlaying={isPlaying} speed={speed} />;
      case "selection-sort":
        return <SelectionSortVisualization isPlaying={isPlaying} speed={speed} />;
      case "merge-sort":
        return <MergeSortVisualization isPlaying={isPlaying} speed={speed} />;
      case "heap-sort":
        return <HeapSortVisualization isPlaying={isPlaying} speed={speed} />;
      case "radix-sort":
        return <RadixSortVisualization isPlaying={isPlaying} speed={speed} />;
      
      // Search Algorithms
      case "linear-search":
        return <LinearSearchVisualization isPlaying={isPlaying} speed={speed} />;
      case "binary-search":
        return <BinarySearchVisualization isPlaying={isPlaying} speed={speed} />;
      case "dfs":
        return <DFSVisualization isPlaying={isPlaying} speed={speed} />;
      case "bfs":
        return <BFSVisualization isPlaying={isPlaying} speed={speed} />;
      
      // Graph Algorithms
      case "dijkstra":
        return <ComingSoonVisualization algorithmName="Dijkstra's Algorithm" />;
      case "a-star":
        return <ComingSoonVisualization algorithmName="A* Search" />;
      case "kruskal":
        return <ComingSoonVisualization algorithmName="Kruskal's Algorithm" />;
      
      // Dynamic Programming
      case "fibonacci":
        return <ComingSoonVisualization algorithmName="Fibonacci Sequence" />;
      case "knapsack":
        return <ComingSoonVisualization algorithmName="0/1 Knapsack" />;
      
      // Miscellaneous
      case "shuffle":
        return <ComingSoonVisualization algorithmName="Fisher-Yates Shuffle" />;
      
      default:
        return <div className="flex items-center justify-center h-full text-muted-foreground">
          Select an algorithm to visualize
        </div>;
    }
  };

  return (
    <div className="h-full p-3 sm:p-6 relative">
      {/* Mobile menu button */}
      {onToggleSidebar && (
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleSidebar}
          className="absolute top-3 left-3 z-10 lg:hidden"
        >
          <Menu className="h-4 w-4" />
        </Button>
      )}
      
      <div className="h-full pt-12 lg:pt-0">
        {renderVisualization()}
      </div>
    </div>
  );
}