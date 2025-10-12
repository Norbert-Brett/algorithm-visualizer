"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Header from "./Header";
import Sidebar from "./Sidebar";
import VisualizationArea from "./VisualizationArea";
import ControlPanel from "./ControlPanel";

export type Algorithm = "stack" | "queue" | "bubble-sort" | "selection-sort" | "merge-sort" | "heap-sort" | "radix-sort";

export default function AlgorithmVisualizer() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<Algorithm>("stack");
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex h-[calc(100vh-4rem)]">
        <Sidebar 
          selectedAlgorithm={selectedAlgorithm}
          onAlgorithmSelect={setSelectedAlgorithm}
        />
        <div className="flex-1 flex flex-col">
          <main className="flex-1 p-6 bg-muted/30">
            <Card className="h-full shadow-sm">
              <VisualizationArea 
                algorithm={selectedAlgorithm}
                isPlaying={isPlaying}
                speed={speed}
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