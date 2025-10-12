import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, RotateCcw, SkipForward, SkipBack } from "lucide-react";
import { Algorithm } from "./AlgorithmVisualizer";

interface ControlPanelProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  algorithm: Algorithm;
}

export default function ControlPanel({
  isPlaying,
  onPlayPause,
  speed,
  onSpeedChange,
  algorithm,
}: ControlPanelProps) {
  return (
    <div className="h-20 bg-background border-t px-6 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button onClick={onPlayPause} size="sm">
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          <Button variant="outline" size="sm">
            <SkipForward className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-foreground font-medium">Speed:</span>
          <div className="w-32">
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

      <div className="text-sm text-muted-foreground">
        Current:{" "}
        <span className="font-medium capitalize text-foreground">
          {algorithm.replace("-", " ")}
        </span>
      </div>
    </div>
  );
}
