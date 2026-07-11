"use client";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, RotateCcw, Square } from "lucide-react";
import { Algorithm } from "./AlgorithmVisualizer";

interface ControlPanelProps {
  isPlaying: boolean;
  isAnimating: boolean;
  onPlayPause: () => void;
  onStop: () => void;
  onReset: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  algorithm: Algorithm;
}

export default function ControlPanel({
  isPlaying,
  isAnimating,
  onPlayPause,
  onStop,
  onReset,
  speed,
  onSpeedChange,
  algorithm,
}: ControlPanelProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-11/12 sm:w-[90%] max-w-xl">
      <div className="glass px-3.5 sm:px-5 py-2.5 rounded-full shadow-xl flex items-center justify-between gap-4 bg-background/80 dark:bg-card/75 backdrop-blur-md border border-border/60">
        
        {/* Playback Controls */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Button
            onClick={onPlayPause}
            size="icon"
            disabled={!isAnimating}
            className={`h-8 w-8 rounded-full transition-all duration-200 active:scale-90 ${
              isAnimating 
                ? "bg-accent hover:bg-accent/90 text-accent-foreground shadow-sm shadow-accent/25" 
                : "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
            }`}
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="h-3.5 w-3.5 fill-current" />
            ) : (
              <Play className="h-3.5 w-3.5 fill-current translate-x-[1px]" />
            )}
          </Button>

          <Button
            onClick={onStop}
            disabled={!isAnimating}
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-muted text-foreground/80 hover:text-foreground transition-all duration-200 active:scale-90 disabled:opacity-40"
            title="Stop Animation"
          >
            <Square className="h-3.5 w-3.5 fill-current" />
          </Button>

          <Button
            onClick={onReset}
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-muted text-foreground/80 hover:text-foreground transition-all duration-200 active:scale-90"
            title="Reset Visualizer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Speed Slider */}
        <div className="flex items-center gap-2 sm:gap-3 flex-grow max-w-[150px] sm:max-w-[180px]">
          <span className="text-[10px] font-mono font-semibold tracking-wider text-muted-foreground uppercase hidden sm:inline">
            Speed
          </span>
          <div className="flex-grow pt-0.5">
            <Slider
              value={[speed]}
              onValueChange={(value) => onSpeedChange(value[0])}
              max={3}
              min={0.5}
              step={0.5}
              className="cursor-pointer"
            />
          </div>
          <span className="text-xs font-mono font-semibold w-7 text-right text-foreground">
            {speed}x
          </span>
        </div>

        {/* Selected Module Indicator */}
        <div className="text-[10px] font-mono text-muted-foreground text-right hidden sm:block flex-shrink-0">
          <span className="opacity-60 uppercase tracking-widest text-[9px] block text-left">Module</span>
          <span className="font-semibold text-foreground uppercase tracking-wider block text-left truncate max-w-[100px]">
            {algorithm.replace("-", " ")}
          </span>
        </div>
        
      </div>
    </div>
  );
}
