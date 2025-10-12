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
const ComingSoonVisualization = ({
  algorithmName,
}: {
  algorithmName: string;
}) => (
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

export default function VisualizationArea({
  algorithm,
  isPlaying,
  speed,
  onToggleSidebar,
}: VisualizationAreaProps) {
  const renderVisualization = () => {
    switch (algorithm) {
      // Data Structures
      case "stack":
        return <StackVisualization isPlaying={isPlaying} speed={speed} />;
      case "queue":
        return <QueueVisualization isPlaying={isPlaying} speed={speed} />;
      case "bst":
        return <BSTVisualization speed={speed} />;
      case "btree":
        return <BTreeVisualization speed={speed} />;

      // Sorting Algorithms
      case "bubble-sort":
        return <BubbleSortVisualization isPlaying={isPlaying} speed={speed} />;
      case "selection-sort":
        return (
          <SelectionSortVisualization isPlaying={isPlaying} speed={speed} />
        );
      case "merge-sort":
        return <MergeSortVisualization isPlaying={isPlaying} speed={speed} />;
      case "heap-sort":
        return <HeapSortVisualization isPlaying={isPlaying} speed={speed} />;
      case "radix-sort":
        return <RadixSortVisualization isPlaying={isPlaying} speed={speed} />;

      // Search Algorithms
      case "linear-search":
        return <LinearSearchVisualization speed={speed} />;
      case "binary-search":
        return <BinarySearchVisualization speed={speed} />;
      case "dfs":
        return <DFSVisualization speed={speed} />;
      case "bfs":
        return <BFSVisualization speed={speed} />;

      // Tree Data Structures
      case "avl-tree":
        return <ComingSoonVisualization algorithmName="AVL Tree" />;
      case "red-black-tree":
        return <ComingSoonVisualization algorithmName="Red-Black Tree" />;
      case "splay-tree":
        return <ComingSoonVisualization algorithmName="Splay Tree" />;
      case "b-plus-tree":
        return <ComingSoonVisualization algorithmName="B+ Tree" />;
      case "trie":
        return <ComingSoonVisualization algorithmName="Trie (Prefix Tree)" />;
      case "radix-tree":
        return <ComingSoonVisualization algorithmName="Radix Tree" />;
      case "ternary-search-tree":
        return <ComingSoonVisualization algorithmName="Ternary Search Tree" />;

      // Hash Tables
      case "open-hash-table":
        return <ComingSoonVisualization algorithmName="Open Hash Table" />;
      case "closed-hash-table":
        return <ComingSoonVisualization algorithmName="Closed Hash Table" />;
      case "bucket-hash-table":
        return <ComingSoonVisualization algorithmName="Bucket Hash Table" />;

      // Heap Data Structures
      case "heap":
        return <ComingSoonVisualization algorithmName="Binary Heap" />;
      case "binomial-queue":
        return <ComingSoonVisualization algorithmName="Binomial Queue" />;
      case "fibonacci-heap":
        return <ComingSoonVisualization algorithmName="Fibonacci Heap" />;
      case "leftist-heap":
        return <ComingSoonVisualization algorithmName="Leftist Heap" />;
      case "skew-heap":
        return <ComingSoonVisualization algorithmName="Skew Heap" />;

      // Additional Search Algorithms
      case "binary-search-sorted":
        return (
          <ComingSoonVisualization algorithmName="Binary Search (Sorted List)" />
        );

      // Additional Sorting Algorithms
      case "insertion-sort":
        return <ComingSoonVisualization algorithmName="Insertion Sort" />;
      case "shell-sort":
        return <ComingSoonVisualization algorithmName="Shell Sort" />;
      case "quick-sort":
        return <ComingSoonVisualization algorithmName="Quick Sort" />;
      case "bucket-sort":
        return <ComingSoonVisualization algorithmName="Bucket Sort" />;
      case "counting-sort":
        return <ComingSoonVisualization algorithmName="Counting Sort" />;

      // Graph Algorithms
      case "connected-components":
        return <ComingSoonVisualization algorithmName="Connected Components" />;
      case "dijkstra":
        return <ComingSoonVisualization algorithmName="Dijkstra's Algorithm" />;
      case "prim-mst":
        return <ComingSoonVisualization algorithmName="Prim's MST" />;
      case "kruskal":
        return <ComingSoonVisualization algorithmName="Kruskal's Algorithm" />;
      case "topological-sort-indegree":
        return (
          <ComingSoonVisualization algorithmName="Topological Sort (Indegree)" />
        );
      case "topological-sort-dfs":
        return (
          <ComingSoonVisualization algorithmName="Topological Sort (DFS)" />
        );
      case "floyd-warshall":
        return <ComingSoonVisualization algorithmName="Floyd-Warshall" />;

      // Dynamic Programming
      case "fibonacci":
        return <ComingSoonVisualization algorithmName="Fibonacci Sequence" />;
      case "making-change":
        return <ComingSoonVisualization algorithmName="Making Change" />;
      case "longest-common-subsequence":
        return (
          <ComingSoonVisualization algorithmName="Longest Common Subsequence" />
        );
      case "knapsack":
        return <ComingSoonVisualization algorithmName="0/1 Knapsack" />;

      // Recursion & Backtracking
      case "recursion-factorial":
        return (
          <ComingSoonVisualization algorithmName="Factorial (Recursive)" />
        );
      case "string-reversal":
        return <ComingSoonVisualization algorithmName="String Reversal" />;
      case "n-queens":
        return <ComingSoonVisualization algorithmName="N-Queens Problem" />;

      // Geometric Algorithms
      case "2d-rotation-scale":
        return <ComingSoonVisualization algorithmName="2D Rotation & Scale" />;
      case "2d-rotation-translation":
        return (
          <ComingSoonVisualization algorithmName="2D Rotation & Translation" />
        );
      case "2d-coordinate-systems":
        return (
          <ComingSoonVisualization algorithmName="2D Coordinate Systems" />
        );
      case "3d-rotation-scale":
        return <ComingSoonVisualization algorithmName="3D Rotation & Scale" />;
      case "3d-coordinate-systems":
        return (
          <ComingSoonVisualization algorithmName="3D Coordinate Systems" />
        );

      // Advanced Data Structures
      case "disjoint-sets":
        return (
          <ComingSoonVisualization algorithmName="Disjoint Sets (Union-Find)" />
        );

      // Miscellaneous
      case "shuffle":
        return <ComingSoonVisualization algorithmName="Fisher-Yates Shuffle" />;
      case "indexing":
        return <ComingSoonVisualization algorithmName="Indexing Techniques" />;

      default:
        return (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Select an algorithm to visualize
          </div>
        );
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

      <div className="h-full pt-12 lg:pt-0">{renderVisualization()}</div>
    </div>
  );
}
