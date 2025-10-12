"use client";

import { Algorithm } from "./AlgorithmVisualizer";
import StackVisualization from "./visualizations/StackVisualization";
import QueueVisualization from "./visualizations/QueueVisualization";
import BubbleSortVisualization from "./visualizations/BubbleSortVisualization";
import SelectionSortVisualization from "./visualizations/SelectionSortVisualization";
import MergeSortVisualization from "./visualizations/MergeSortVisualization";
import HeapSortVisualization from "./visualizations/HeapSortVisualization";
import RadixSortVisualization from "./visualizations/RadixSortVisualization";

interface VisualizationAreaProps {
  algorithm: Algorithm;
  isPlaying: boolean;
  speed: number;
}

export default function VisualizationArea({ algorithm, isPlaying, speed }: VisualizationAreaProps) {
  const renderVisualization = () => {
    switch (algorithm) {
      case "stack":
        return <StackVisualization isPlaying={isPlaying} speed={speed} />;
      case "queue":
        return <QueueVisualization isPlaying={isPlaying} speed={speed} />;
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
      default:
        return <div className="flex items-center justify-center h-full text-muted-foreground">
          Select an algorithm to visualize
        </div>;
    }
  };

  return (
    <div className="h-full p-6">
      {renderVisualization()}
    </div>
  );
}