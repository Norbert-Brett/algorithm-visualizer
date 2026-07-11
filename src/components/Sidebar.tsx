"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Layers,
  ArrowRight,
  Binary,
  Network,
  BarChart3,
  ArrowUpDown,
  GitMerge,
  TreePine,
  Hash,
  Search,
  Route,
  Zap,
  Target,
  Shuffle,
  Grid3X3,
  MapPin,
  Cpu,
  RotateCcw,
  ChevronDown,
  X,
} from "lucide-react";
import { Algorithm } from "./AlgorithmVisualizer";

interface SidebarProps {
  selectedAlgorithm: Algorithm;
  onAlgorithmSelect: (algorithm: Algorithm) => void;
  onClose?: () => void;
}

const algorithms = [
  {
    category: "Basic Data Structures",
    items: [
      {
        id: "stack" as Algorithm,
        name: "Stack",
        icon: Layers,
        description: "LIFO data structure",
      },
      {
        id: "queue" as Algorithm,
        name: "Queue",
        icon: ArrowRight,
        description: "FIFO data structure",
      },
    ],
  },
  {
    category: "Tree Data Structures",
    items: [
      {
        id: "bst" as Algorithm,
        name: "Binary Search Tree",
        icon: Binary,
        description: "Ordered binary tree structure",
      },
      {
        id: "avl-tree" as Algorithm,
        name: "AVL Tree",
        icon: Binary,
        description: "Self-balancing BST",
      },
      {
        id: "red-black-tree" as Algorithm,
        name: "Red-Black Tree",
        icon: Binary,
        description: "Balanced binary search tree",
      },
      {
        id: "splay-tree" as Algorithm,
        name: "Splay Tree",
        icon: Binary,
        description: "Self-adjusting BST",
      },
      {
        id: "btree" as Algorithm,
        name: "B-Tree",
        icon: Network,
        description: "Multi-way balanced tree",
      },
      {
        id: "b-plus-tree" as Algorithm,
        name: "B+ Tree",
        icon: Network,
        description: "B-tree variant for databases",
      },
      {
        id: "trie" as Algorithm,
        name: "Trie (Prefix Tree)",
        icon: Network,
        description: "26-ary tree for strings",
      },
      {
        id: "radix-tree" as Algorithm,
        name: "Radix Tree",
        icon: Network,
        description: "Compact trie structure",
      },
      {
        id: "ternary-search-tree" as Algorithm,
        name: "Ternary Search Tree",
        icon: Network,
        description: "Trie with BST children",
      },
    ],
  },
  {
    category: "Hash Tables",
    items: [
      {
        id: "open-hash-table" as Algorithm,
        name: "Open Hash Table",
        icon: Hash,
        description: "Closed addressing (chaining)",
      },
      {
        id: "closed-hash-table" as Algorithm,
        name: "Closed Hash Table",
        icon: Hash,
        description: "Open addressing (probing)",
      },
      {
        id: "bucket-hash-table" as Algorithm,
        name: "Bucket Hash Table",
        icon: Hash,
        description: "Hash table with buckets",
      },
    ],
  },
  {
    category: "Heap Data Structures",
    items: [
      {
        id: "heap" as Algorithm,
        name: "Binary Heap",
        icon: TreePine,
        description: "Complete binary tree heap",
      },
      {
        id: "binomial-queue" as Algorithm,
        name: "Binomial Queue",
        icon: TreePine,
        description: "Collection of binomial trees",
      },
      {
        id: "fibonacci-heap" as Algorithm,
        name: "Fibonacci Heap",
        icon: TreePine,
        description: "Advanced heap structure",
      },
      {
        id: "leftist-heap" as Algorithm,
        name: "Leftist Heap",
        icon: TreePine,
        description: "Mergeable heap structure",
      },
      {
        id: "skew-heap" as Algorithm,
        name: "Skew Heap",
        icon: TreePine,
        description: "Self-adjusting heap",
      },
    ],
  },
  {
    category: "Search Algorithms",
    items: [
      {
        id: "linear-search" as Algorithm,
        name: "Linear Search",
        icon: Search,
        description: "Sequential element search",
      },
      {
        id: "binary-search" as Algorithm,
        name: "Binary Search",
        icon: Target,
        description: "Divide and conquer search",
      },
      {
        id: "binary-search-sorted" as Algorithm,
        name: "Binary Search (Sorted)",
        icon: Target,
        description: "Search in sorted list",
      },
    ],
  },
  {
    category: "Sorting Algorithms",
    items: [
      {
        id: "bubble-sort" as Algorithm,
        name: "Bubble Sort",
        icon: BarChart3,
        description: "Simple comparison sort",
      },
      {
        id: "selection-sort" as Algorithm,
        name: "Selection Sort",
        icon: ArrowUpDown,
        description: "In-place comparison sort",
      },
      {
        id: "insertion-sort" as Algorithm,
        name: "Insertion Sort",
        icon: ArrowUpDown,
        description: "Build sorted array incrementally",
      },
      {
        id: "shell-sort" as Algorithm,
        name: "Shell Sort",
        icon: ArrowUpDown,
        description: "Generalized insertion sort",
      },
      {
        id: "merge-sort" as Algorithm,
        name: "Merge Sort",
        icon: GitMerge,
        description: "Divide and conquer sort",
      },
      {
        id: "quick-sort" as Algorithm,
        name: "Quick Sort",
        icon: Zap,
        description: "Efficient divide-conquer sort",
      },
      {
        id: "heap-sort" as Algorithm,
        name: "Heap Sort",
        icon: TreePine,
        description: "Heap-based sorting",
      },
      {
        id: "bucket-sort" as Algorithm,
        name: "Bucket Sort",
        icon: Hash,
        description: "Distribution sort algorithm",
      },
      {
        id: "counting-sort" as Algorithm,
        name: "Counting Sort",
        icon: Hash,
        description: "Integer sorting algorithm",
      },
      {
        id: "radix-sort" as Algorithm,
        name: "Radix Sort",
        icon: Hash,
        description: "Non-comparison digit sort",
      },
    ],
  },
  {
    category: "Graph Algorithms",
    items: [
      {
        id: "dfs" as Algorithm,
        name: "Depth-First Search",
        icon: Route,
        description: "Graph traversal algorithm",
      },
      {
        id: "bfs" as Algorithm,
        name: "Breadth-First Search",
        icon: Network,
        description: "Level-order graph traversal",
      },
      {
        id: "connected-components" as Algorithm,
        name: "Connected Components",
        icon: Network,
        description: "Find graph components",
      },
      {
        id: "dijkstra" as Algorithm,
        name: "Dijkstra's Algorithm",
        icon: MapPin,
        description: "Shortest path algorithm",
      },
      {
        id: "prim-mst" as Algorithm,
        name: "Prim's MST",
        icon: Network,
        description: "Minimum spanning tree",
      },
      {
        id: "kruskal" as Algorithm,
        name: "Kruskal's Algorithm",
        icon: Network,
        description: "Minimum spanning tree",
      },
      {
        id: "topological-sort-indegree" as Algorithm,
        name: "Topological Sort (Indegree)",
        icon: Route,
        description: "Using indegree array",
      },
      {
        id: "topological-sort-dfs" as Algorithm,
        name: "Topological Sort (DFS)",
        icon: Route,
        description: "Using depth-first search",
      },
      {
        id: "floyd-warshall" as Algorithm,
        name: "Floyd-Warshall",
        icon: MapPin,
        description: "All pairs shortest paths",
      },
    ],
  },
  {
    category: "Dynamic Programming",
    items: [
      {
        id: "fibonacci" as Algorithm,
        name: "Fibonacci Sequence",
        icon: Cpu,
        description: "Classic DP problem",
      },
      {
        id: "making-change" as Algorithm,
        name: "Making Change",
        icon: Cpu,
        description: "Coin change problem",
      },
      {
        id: "longest-common-subsequence" as Algorithm,
        name: "Longest Common Subsequence",
        icon: Cpu,
        description: "LCS dynamic programming",
      },
      {
        id: "knapsack" as Algorithm,
        name: "0/1 Knapsack",
        icon: Grid3X3,
        description: "Optimization problem",
      },
    ],
  },
  {
    category: "Recursion & Backtracking",
    items: [
      {
        id: "recursion-factorial" as Algorithm,
        name: "Factorial (Recursive)",
        icon: Cpu,
        description: "Recursive factorial calculation",
      },
      {
        id: "string-reversal" as Algorithm,
        name: "String Reversal",
        icon: ArrowUpDown,
        description: "Reverse string recursively",
      },
      {
        id: "n-queens" as Algorithm,
        name: "N-Queens Problem",
        icon: Grid3X3,
        description: "Backtracking chess problem",
      },
    ],
  },
  {
    category: "Geometric Algorithms",
    items: [
      {
        id: "2d-rotation-scale" as Algorithm,
        name: "2D Rotation & Scale",
        icon: RotateCcw,
        description: "2D transformation matrices",
      },
      {
        id: "2d-rotation-translation" as Algorithm,
        name: "2D Rotation & Translation",
        icon: RotateCcw,
        description: "2D transformation matrices",
      },
      {
        id: "2d-coordinate-systems" as Algorithm,
        name: "2D Coordinate Systems",
        icon: Grid3X3,
        description: "Changing coordinate systems",
      },
      {
        id: "3d-rotation-scale" as Algorithm,
        name: "3D Rotation & Scale",
        icon: RotateCcw,
        description: "3D transformation matrices",
      },
      {
        id: "3d-coordinate-systems" as Algorithm,
        name: "3D Coordinate Systems",
        icon: Grid3X3,
        description: "3D coordinate transformations",
      },
    ],
  },
  {
    category: "Advanced Data Structures",
    items: [
      {
        id: "disjoint-sets" as Algorithm,
        name: "Disjoint Sets (Union-Find)",
        icon: Network,
        description: "Union-find data structure",
      },
    ],
  },
  {
    category: "Miscellaneous",
    items: [
      {
        id: "shuffle" as Algorithm,
        name: "Fisher-Yates Shuffle",
        icon: Shuffle,
        description: "Array randomization",
      },
      {
        id: "indexing" as Algorithm,
        name: "Indexing Techniques",
        icon: Hash,
        description: "Data indexing methods",
      },
    ],
  },
];

// List of implemented algorithms
const implementedAlgorithmIds = [
  "stack",
  "queue",
  "bst",
  "avl-tree",
  "red-black-tree",
  "splay-tree",
  "btree",
  "b-plus-tree",
  "trie",
  "radix-tree",
  "ternary-search-tree",
  "open-hash-table",
  "closed-hash-table",
  "bucket-hash-table",
  "heap",
  "binomial-queue",
  "fibonacci-heap",
  "leftist-heap",
  "skew-heap",
  "bubble-sort",
  "selection-sort",
  "insertion-sort",
  "shell-sort",
  "merge-sort",
  "quick-sort",
  "heap-sort",
  "bucket-sort",
  "counting-sort",
  "radix-sort",
  "linear-search",
  "binary-search",
  "binary-search-sorted",
  "dfs",
  "bfs",
  "connected-components",
  "dijkstra",
  "prim-mst",
  "kruskal",
  "topological-sort-indegree",
  "topological-sort-dfs",
  "floyd-warshall",
  "fibonacci",
  "making-change",
  "longest-common-subsequence",
  "knapsack",
  "recursion-factorial",
  "string-reversal",
  "n-queens",
  "2d-rotation-scale",
  "2d-rotation-translation",
  "2d-coordinate-systems",
  "3d-rotation-scale",
  "3d-coordinate-systems",
  "disjoint-sets",
  "shuffle",
  "indexing",
];

export default function Sidebar({
  selectedAlgorithm,
  onAlgorithmSelect,
  onClose,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // Count total and implemented
  const totalAlgorithms = algorithms.reduce(
    (sum, category) => sum + category.items.length,
    0
  );
  const implementedAlgorithms = algorithms.reduce((sum, category) => {
    return (
      sum +
      category.items.filter((item) =>
        implementedAlgorithmIds.includes(item.id)
      ).length
    );
  }, 0);

  // Expand the active algorithm's category on mount or change (if not searching)
  useEffect(() => {
    if (!searchQuery) {
      const activeCat = algorithms.find((cat) =>
        cat.items.some((item) => item.id === selectedAlgorithm)
      );
      if (activeCat) {
        setExpandedCategories((prev) => ({
          ...prev,
          [activeCat.category]: true,
        }));
      }
    }
  }, [selectedAlgorithm, searchQuery]);

  // Handle search filtering
  const filteredCategories = useMemo(() => {
    return algorithms
      .map((category) => {
        const matchedItems = category.items.filter(
          (item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
        return {
          ...category,
          items: matchedItems,
        };
      })
      .filter((category) => category.items.length > 0);
  }, [searchQuery]);

  // Auto-expand categories with matches when query is present
  useEffect(() => {
    if (searchQuery) {
      const autoExpanded: Record<string, boolean> = {};
      filteredCategories.forEach((cat) => {
        autoExpanded[cat.category] = true;
      });
      setExpandedCategories(autoExpanded);
    }
  }, [searchQuery, filteredCategories]);

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryName]: !prev[categoryName],
    }));
  };

  return (
    <aside className="w-full max-w-[320px] sm:w-80 h-full border-r bg-sidebar/50 backdrop-blur-md flex flex-col">
      {/* Header Info */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between mb-1.5">
          <h2 className="text-sm font-semibold tracking-tight text-foreground font-sans">
            Algorithm Catalog
          </h2>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="lg:hidden h-7 w-7 rounded-full hover:bg-muted/80"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground font-sans">
          {implementedAlgorithms} of {totalAlgorithms} modules compiled
        </p>

        {/* Search Bar */}
        <div className="relative mt-3">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search catalog..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-8 h-8.5 text-xs bg-background/50 hover:bg-background/80 focus:bg-background transition-all duration-200 border-border/50 rounded-lg placeholder:text-muted-foreground/75"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Accordion Scroll Area */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3.5 custom-scrollbar">
        {filteredCategories.map((category) => {
          const isExpanded = !!expandedCategories[category.category];
          const categoryImplemented = category.items.filter((item) =>
            implementedAlgorithmIds.includes(item.id)
          ).length;

          return (
            <div key={category.category} className="space-y-1.5">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category.category)}
                className="w-full flex items-center justify-between py-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors group tracking-wider uppercase font-mono"
              >
                <div className="flex items-center gap-1.5">
                  <ChevronDown
                    className={`h-3 w-3 transition-transform duration-200 ${
                      isExpanded ? "rotate-0" : "-rotate-90"
                    } text-muted-foreground group-hover:text-foreground`}
                  />
                  <span>{category.category}</span>
                </div>
                <span className="text-[9px] bg-muted/65 text-muted-foreground font-sans px-1.5 py-0.2 rounded-full font-normal">
                  {categoryImplemented}/{category.items.length}
                </span>
              </button>

              {/* Collapsible Content */}
              {isExpanded && (
                <div className="space-y-1 pl-1 origin-top transition-all duration-300">
                  {category.items.map((algorithm) => {
                    const Icon = algorithm.icon;
                    const isSelected = selectedAlgorithm === algorithm.id;
                    const isImplemented = implementedAlgorithmIds.includes(
                      algorithm.id
                    );

                    return (
                      <button
                        key={algorithm.id}
                        onClick={() =>
                          isImplemented && onAlgorithmSelect(algorithm.id)
                        }
                        disabled={!isImplemented}
                        className={`
                          w-full flex items-start gap-2.5 p-2 rounded-lg text-left transition-all duration-200 relative group
                          ${
                            isSelected
                              ? "bg-accent/10 text-accent font-medium"
                              : "hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                          }
                          ${
                            !isImplemented
                              ? "opacity-45 cursor-not-allowed"
                              : "cursor-pointer"
                          }
                        `}
                      >
                        {isSelected && (
                          <motion.div
                            layoutId="active-indicator"
                            className="absolute left-0 top-1.5 bottom-1.5 w-0.75 bg-accent rounded-full"
                            transition={{
                              type: "spring",
                              stiffness: 350,
                              damping: 30,
                            }}
                          />
                        )}
                        <Icon
                          className={`h-4 w-4 mt-0.5 flex-shrink-0 transition-colors ${
                            isSelected
                              ? "text-accent"
                              : "text-muted-foreground group-hover:text-foreground"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 justify-between">
                            <span
                              className={`text-[12.5px] truncate font-sans tracking-tight leading-none ${
                                isSelected
                                  ? "text-foreground font-semibold"
                                  : "font-medium"
                              }`}
                            >
                              {algorithm.name}
                            </span>
                            {!isImplemented && (
                              <span className="text-[8px] font-bold border border-amber-500/15 text-amber-500 bg-amber-500/5 px-1 py-0.2 rounded-sm flex-shrink-0 font-sans tracking-wide">
                                SOON
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground truncate group-hover:text-muted-foreground/80 mt-0.5">
                            {algorithm.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
        {filteredCategories.length === 0 && (
          <div className="text-center py-8 text-xs text-muted-foreground">
            No matching algorithms found.
          </div>
        )}
      </div>
    </aside>
  );
}
