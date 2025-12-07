import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
];

export default function Sidebar({
  selectedAlgorithm,
  onAlgorithmSelect,
  onClose,
}: SidebarProps) {
  // Count total algorithms and implemented ones
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

  return (
    <aside className="w-80 h-fit border-r bg-sidebar p-4 overflow-y-auto max-h-screen">
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-sidebar-foreground">
              Algorithm Visualizer
            </h2>
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="lg:hidden"
              >
                ✕
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            {implementedAlgorithms} of {totalAlgorithms} algorithms implemented
          </p>
          <div className="space-y-4">
            {algorithms.map((category) => {
              const categoryImplemented = category.items.filter((item) =>
                implementedAlgorithmIds.includes(item.id)
              ).length;

              return (
                <Card
                  key={category.category}
                  className="p-3 sm:p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                      {category.category}
                    </h3>
                    <span className="text-xs bg-muted px-2 py-1 rounded-full">
                      {categoryImplemented}/{category.items.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {category.items.map((algorithm) => {
                      const Icon = algorithm.icon;
                      const isImplemented = implementedAlgorithmIds.includes(algorithm.id);

                      return (
                        <Button
                          key={algorithm.id}
                          variant={
                            selectedAlgorithm === algorithm.id
                              ? "default"
                              : "ghost"
                          }
                          className={`w-full justify-start h-auto p-2 sm:p-3 ${
                            !isImplemented ? "opacity-60" : ""
                          }`}
                          onClick={() => onAlgorithmSelect(algorithm.id)}
                        >
                          <div className="flex items-start gap-2 sm:gap-3">
                            <Icon className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 flex-shrink-0" />
                            <div className="text-left flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm sm:text-base truncate">
                                  {algorithm.name}
                                </span>
                                {!isImplemented && (
                                  <span className="text-[10px] sm:text-xs bg-orange-100 text-orange-700 px-1 sm:px-1.5 py-0.5 rounded flex-shrink-0">
                                    Soon
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] sm:text-xs text-muted-foreground">
                                {algorithm.description}
                              </div>
                            </div>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
