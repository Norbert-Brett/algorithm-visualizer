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
  console.log('ControlPanel render:', { isPlaying, isAnimating, speed });
  
  return (
    <div className="min-h-[5rem] bg-background border-t px-3 sm:px-6 py-3 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <Button 
              onClick={onPlayPause} 
              size="sm"
              title={isPlaying ? "Pause" : "Play"}
              disabled={!isAnimating}
              variant={isAnimating ? "default" : "outline"}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onStop}
              title="Stop"
              disabled={!isAnimating}
            >
              <Square className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onReset}
              title="Reset"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-1 sm:flex-initial">
            <span className="text-sm text-foreground font-medium">Speed:</span>
            <div className="w-20 sm:w-32">
              <Slider
                value={[speed]}
                onValueChange={(value) => onSpeedChange(value[0])}
                max={3}
                min={0.5}
                step={0.5}
                className="w-full"
              />
            </div>
            <span className="text-sm font-mono w-8">{speed}x</span>
          </div>
        </div>

        <div className="text-sm text-muted-foreground w-full sm:w-auto text-left sm:text-right">
          <span className="hidden sm:inline">Current: </span>
          <span className="font-medium capitalize text-foreground">
            {algorithm.replace("-", " ")}
          </span>
        </div>
      </div>
    </div>
  );
}
