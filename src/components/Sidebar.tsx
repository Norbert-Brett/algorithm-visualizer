import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Layers, ArrowRight, BarChart3, ArrowUpDown, GitMerge, TreePine, Hash } from "lucide-react";
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
];

export default function Sidebar({
  selectedAlgorithm,
  onAlgorithmSelect,
}: SidebarProps) {
  return (
    <aside className="w-80 border-r bg-sidebar p-4">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4 text-sidebar-foreground">
            Algorithms
          </h2>
          <div className="space-y-4">
            {algorithms.map((category) => (
              <Card
                key={category.category}
                className="p-4"
              >
                <h3 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wide">
                  {category.category}
                </h3>
                <div className="space-y-2">
                  {category.items.map((algorithm) => {
                    const Icon = algorithm.icon;
                    return (
                      <Button
                        key={algorithm.id}
                        variant={
                          selectedAlgorithm === algorithm.id
                            ? "default"
                            : "ghost"
                        }
                        className="w-full justify-start h-auto p-3"
                        onClick={() => onAlgorithmSelect(algorithm.id)}
                      >
                        <div className="flex items-start gap-3">
                          <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                          <div className="text-left">
                            <div className="font-medium">
                              {algorithm.name}
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
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
