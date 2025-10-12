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
  Cpu
} from "lucide-react";
import { Algorithm } from "./AlgorithmVisualizer";

interface SidebarProps {
  selectedAlgorithm: Algorithm;
  onAlgorithmSelect: (algorithm: Algorithm) => void;
}

const algorithms = [
  {
    category: "Data Structures",
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
      {
        id: "bst" as Algorithm,
        name: "Binary Search Tree",
        icon: Binary,
        description: "Ordered binary tree structure",
      },
      {
        id: "btree" as Algorithm,
        name: "B-Tree",
        icon: Network,
        description: "Multi-way balanced tree",
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
        id: "merge-sort" as Algorithm,
        name: "Merge Sort",
        icon: GitMerge,
        description: "Divide and conquer sort",
      },
      {
        id: "heap-sort" as Algorithm,
        name: "Heap Sort",
        icon: TreePine,
        description: "Heap-based sorting",
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
    ],
  },
  {
    category: "Graph Algorithms",
    items: [
      {
        id: "dijkstra" as Algorithm,
        name: "Dijkstra's Algorithm",
        icon: MapPin,
        description: "Shortest path algorithm",
      },
      {
        id: "a-star" as Algorithm,
        name: "A* Search",
        icon: Zap,
        description: "Heuristic pathfinding",
      },
      {
        id: "kruskal" as Algorithm,
        name: "Kruskal's Algorithm",
        icon: Network,
        description: "Minimum spanning tree",
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
        id: "knapsack" as Algorithm,
        name: "0/1 Knapsack",
        icon: Grid3X3,
        description: "Optimization problem",
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
    ],
  },
];

export default function Sidebar({
  selectedAlgorithm,
  onAlgorithmSelect,
}: SidebarProps) {
  // Count total algorithms and implemented ones
  const totalAlgorithms = algorithms.reduce((sum, category) => sum + category.items.length, 0);
  const implementedAlgorithms = algorithms.reduce((sum, category) => {
    return sum + category.items.filter(item => 
      ["stack", "queue", "bst", "btree", "bubble-sort", "selection-sort", "merge-sort", "heap-sort", "radix-sort"].includes(item.id)
    ).length;
  }, 0);

  return (
    <aside className="w-80 border-r bg-sidebar p-4 overflow-y-auto">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-2 text-sidebar-foreground">
            Algorithm Visualizer
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            {implementedAlgorithms} of {totalAlgorithms} algorithms implemented
          </p>
          <div className="space-y-4">
            {algorithms.map((category) => {
              const categoryImplemented = category.items.filter(item => 
                ["stack", "queue", "bst", "btree", "bubble-sort", "selection-sort", "merge-sort", "heap-sort", "radix-sort"].includes(item.id)
              ).length;
              
              return (
                <Card
                  key={category.category}
                  className="p-4 hover:shadow-md transition-shadow"
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
                      const isImplemented = ["stack", "queue", "bst", "btree", "bubble-sort", "selection-sort", "merge-sort", "heap-sort", "radix-sort"].includes(algorithm.id);
                      
                      return (
                        <Button
                          key={algorithm.id}
                          variant={
                            selectedAlgorithm === algorithm.id
                              ? "default"
                              : "ghost"
                          }
                          className={`w-full justify-start h-auto p-3 ${
                            !isImplemented ? "opacity-60" : ""
                          }`}
                          onClick={() => onAlgorithmSelect(algorithm.id)}
                        >
                          <div className="flex items-start gap-3">
                            <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                            <div className="text-left flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {algorithm.name}
                                </span>
                                {!isImplemented && (
                                  <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">
                                    Soon
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">
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
