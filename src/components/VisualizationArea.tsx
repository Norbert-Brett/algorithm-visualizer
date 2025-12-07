"use client";

import { Algorithm } from "./AlgorithmVisualizer";
import { Button } from "./ui/button";
import { Menu } from "lucide-react";
import StackVisualization from "./visualizations/StackVisualization";
import QueueVisualization from "./visualizations/QueueVisualization";
import BSTVisualization from "./visualizations/BSTVisualization";
import BTreeVisualization from "./visualizations/BTreeVisualization";
import AVLTreeVisualization from "./visualizations/AVLTreeVisualization";
import RedBlackTreeVisualization from "./visualizations/RedBlackTreeVisualization";
import SplayTreeVisualization from "./visualizations/SplayTreeVisualization";
import BubbleSortVisualization from "./visualizations/BubbleSortVisualization";
import SelectionSortVisualization from "./visualizations/SelectionSortVisualization";
import InsertionSortVisualization from "./visualizations/InsertionSortVisualization";
import ShellSortVisualization from "./visualizations/ShellSortVisualization";
import MergeSortVisualization from "./visualizations/MergeSortVisualization";
import QuickSortVisualization from "./visualizations/QuickSortVisualization";
import HeapSortVisualization from "./visualizations/HeapSortVisualization";
import BucketSortVisualization from "./visualizations/BucketSortVisualization";
import CountingSortVisualization from "./visualizations/CountingSortVisualization";
import RadixSortVisualization from "./visualizations/RadixSortVisualization";
import LinearSearchVisualization from "./visualizations/LinearSearchVisualization";
import BinarySearchVisualization from "./visualizations/BinarySearchVisualization";
import DFSVisualization from "./visualizations/DFSVisualization";
import BFSVisualization from "./visualizations/BFSVisualization";
import DijkstraVisualization from "./visualizations/DijkstraVisualization";
import OpenHashTableVisualization from "./visualizations/OpenHashTableVisualization";
import ClosedHashTableVisualization from "./visualizations/ClosedHashTableVisualization";
import BucketHashTableVisualization from "./visualizations/BucketHashTableVisualization";
import BinaryHeapVisualization from "./visualizations/BinaryHeapVisualization";
import BinomialQueueVisualization from "./visualizations/BinomialQueueVisualization";
import FibonacciHeapVisualization from "./visualizations/FibonacciHeapVisualization";
import LeftistHeapVisualization from "./visualizations/LeftistHeapVisualization";
import SkewHeapVisualization from "./visualizations/SkewHeapVisualization";
import BPlusTreeVisualization from "./visualizations/BPlusTreeVisualization";
import TrieVisualization from "./visualizations/TrieVisualization";
import RadixTreeVisualization from "./visualizations/RadixTreeVisualization";
import TernarySearchTreeVisualization from "./visualizations/TernarySearchTreeVisualization";
import BinarySearchSortedVisualization from "./visualizations/BinarySearchSortedVisualization";
import ConnectedComponentsVisualization from "./visualizations/ConnectedComponentsVisualization";
import PrimMSTVisualization from "./visualizations/PrimMSTVisualization";
import KruskalVisualization from "./visualizations/KruskalVisualization";
import TopologicalSortIndegreeVisualization from "./visualizations/TopologicalSortIndegreeVisualization";
import TopologicalSortDFSVisualization from "./visualizations/TopologicalSortDFSVisualization";
import FloydWarshallVisualization from "./visualizations/FloydWarshallVisualization";
import FibonacciVisualization from "./visualizations/FibonacciVisualization";
import MakingChangeVisualization from "./visualizations/MakingChangeVisualization";
import LCSVisualization from "./visualizations/LCSVisualization";
import KnapsackVisualization from "./visualizations/KnapsackVisualization";
import FactorialVisualization from "./visualizations/FactorialVisualization";
import StringReversalVisualization from "./visualizations/StringReversalVisualization";
import NQueensVisualization from "./visualizations/NQueensVisualization";

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
      case "insertion-sort":
        return (
          <InsertionSortVisualization isPlaying={isPlaying} speed={speed} />
        );
      case "shell-sort":
        return <ShellSortVisualization isPlaying={isPlaying} speed={speed} />;
      case "merge-sort":
        return <MergeSortVisualization isPlaying={isPlaying} speed={speed} />;
      case "quick-sort":
        return <QuickSortVisualization isPlaying={isPlaying} speed={speed} />;
      case "heap-sort":
        return <HeapSortVisualization isPlaying={isPlaying} speed={speed} />;
      case "bucket-sort":
        return <BucketSortVisualization isPlaying={isPlaying} speed={speed} />;
      case "counting-sort":
        return <CountingSortVisualization isPlaying={isPlaying} speed={speed} />;
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
        return <AVLTreeVisualization speed={speed} />;
      case "red-black-tree":
        return <RedBlackTreeVisualization speed={speed} />;
      case "splay-tree":
        return <SplayTreeVisualization speed={speed} />;
      case "b-plus-tree":
        return <BPlusTreeVisualization speed={speed} />;
      case "trie":
        return <TrieVisualization speed={speed} />;
      case "radix-tree":
        return <RadixTreeVisualization speed={speed} />;
      case "ternary-search-tree":
        return <TernarySearchTreeVisualization speed={speed} />;

      // Hash Tables
      case "open-hash-table":
        return <OpenHashTableVisualization speed={speed} />;
      case "closed-hash-table":
        return <ClosedHashTableVisualization speed={speed} />;
      case "bucket-hash-table":
        return <BucketHashTableVisualization speed={speed} />;

      // Heap Data Structures
      case "heap":
        return <BinaryHeapVisualization speed={speed} />;
      case "binomial-queue":
        return <BinomialQueueVisualization speed={speed} />;
      case "fibonacci-heap":
        return <FibonacciHeapVisualization speed={speed} />;
      case "leftist-heap":
        return <LeftistHeapVisualization speed={speed} />;
      case "skew-heap":
        return <SkewHeapVisualization speed={speed} />;

      // Additional Search Algorithms
      case "binary-search-sorted":
        return <BinarySearchSortedVisualization speed={speed} />;

      // Graph Algorithms
      case "connected-components":
        return <ConnectedComponentsVisualization speed={speed} />;
      case "dijkstra":
        return <DijkstraVisualization speed={speed} />;
      case "prim-mst":
        return <PrimMSTVisualization speed={speed} />;
      case "kruskal":
        return <KruskalVisualization speed={speed} />;
      case "topological-sort-indegree":
        return <TopologicalSortIndegreeVisualization speed={speed} />;
      case "topological-sort-dfs":
        return <TopologicalSortDFSVisualization speed={speed} />;
      case "floyd-warshall":
        return <FloydWarshallVisualization speed={speed} />;

      // Dynamic Programming
      case "fibonacci":
        return <FibonacciVisualization speed={speed} />;
      case "making-change":
        return <MakingChangeVisualization speed={speed} />;
      case "longest-common-subsequence":
        return <LCSVisualization speed={speed} />;
      case "knapsack":
        return <KnapsackVisualization speed={speed} />;

      // Recursion & Backtracking
      case "recursion-factorial":
        return <FactorialVisualization speed={speed} />;
      case "string-reversal":
        return <StringReversalVisualization speed={speed} />;
      case "n-queens":
        return <NQueensVisualization speed={speed} />;

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
