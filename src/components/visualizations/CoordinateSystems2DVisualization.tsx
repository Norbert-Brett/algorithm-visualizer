"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { RotateCcw } from "lucide-react";

interface CoordinateSystems2DVisualizationProps {
  speed: number;
}

interface Point {
  x: number;
  y: number;
}

export default function CoordinateSystems2DVisualization({
  speed,
}: CoordinateSystems2DVisualizationProps) {
  const [localX, setLocalX] = useState(50);
  const [localY, setLocalY] = useState(50);
  const [localAngle, setLocalAngle] = useState(30);
  const [pointLocalX, setPointLocalX] = useState(30);
  const [pointLocalY, setPointLocalY] = useState(20);

  const reset = () => {
    setLocalX(50);
    setLocalY(50);
    setLocalAngle(30);
    setPointLocalX(30);
    setPointLocalY(20);
  };

  // Transform point from local to world coordinates
  const localToWorld = (localPoint: Point): Point => {
    const rad = (localAngle * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    // Rotate then translate
    return {
      x: localPoint.x * cos - localPoint.y * sin + localX,
      y: localPoint.x * sin + localPoint.y * cos + localY,
    };
  };

  const worldPoint = localToWorld({ x: pointLocalX, y: pointLocalY });

  // Local frame axes in world coordinates
  const localOriginWorld = { x: localX, y: localY };
  const rad = (localAngle * Math.PI) / 180;
  const localXAxisEnd = localToWorld({ x: 60, y: 0 });
  const localYAxisEnd = localToWorld({ x: 0, y: 60 });

  // Transformation matrix
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const matrix = [
    [cos, -sin, localX],
    [sin, cos, localY],
    [0, 0, 1],
  ];

  return (
    <div className="h-full flex flex-col p-2 sm:p-0">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-2 text-foreground">
          2D Coordinate Systems
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Visualize transformations between world and local coordinate frames.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 flex-1">
        {/* Controls */}
        <div className="w-full lg:w-80 space-y-4 order-2 lg:order-1">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Local Frame Position</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium">X: {localX}</label>
              <Slider
                value={[localX]}
                onValueChange={(v) => setLocalX(v[0])}
                min={-100}
                max={100}
                step={5}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Y: {localY}</label>
              <Slider
                value={[localY]}
                onValueChange={(v) => setLocalY(v[0])}
                min={-100}
                max={100}
                step={5}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Rotation: {localAngle}°
              </label>
              <Slider
                value={[localAngle]}
                onValueChange={(v) => setLocalAngle(v[0])}
                min={0}
                max={360}
                step={1}
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t">
            <h3 className="text-sm font-semibold">Point in Local Frame</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Local X: {pointLocalX}
              </label>
              <Slider
                value={[pointLocalX]}
                onValueChange={(v) => setPointLocalX(v[0])}
                min={-50}
                max={50}
                step={5}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Local Y: {pointLocalY}
              </label>
              <Slider
                value={[pointLocalY]}
                onValueChange={(v) => setPointLocalY(v[0])}
                min={-50}
                max={50}
                step={5}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={reset} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>

          <div className="pt-4 border-t">
            <div className="text-sm space-y-2">
              <div>
                <span className="font-semibold">Point Coordinates:</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Local:</span>
                <Badge variant="secondary">
                  ({pointLocalX}, {pointLocalY})
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>World:</span>
                <Badge variant="default">
                  ({worldPoint.x.toFixed(1)}, {worldPoint.y.toFixed(1)})
                </Badge>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-semibold mb-2">
                Local → World Matrix
              </h3>
              <div className="bg-muted p-3 rounded-lg font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span>[</span>
                  <div className="flex flex-col gap-1">
                    <div className="flex gap-2">
                      <span className="w-12 text-right">
                        {matrix[0][0].toFixed(2)}
                      </span>
                      <span className="w-12 text-right">
                        {matrix[0][1].toFixed(2)}
                      </span>
                      <span className="w-12 text-right">
                        {matrix[0][2].toFixed(0)}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="w-12 text-right">
                        {matrix[1][0].toFixed(2)}
                      </span>
                      <span className="w-12 text-right">
                        {matrix[1][1].toFixed(2)}
                      </span>
                      <span className="w-12 text-right">
                        {matrix[1][2].toFixed(0)}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="w-12 text-right">{matrix[2][0]}</span>
                      <span className="w-12 text-right">{matrix[2][1]}</span>
                      <span className="w-12 text-right">{matrix[2][2]}</span>
                    </div>
                  </div>
                  <span>]</span>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-muted-foreground font-medium">
                  World Frame
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-muted-foreground font-medium">
                  Local Frame
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className="text-muted-foreground font-medium">
                  Point
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Visualization */}
        <div className="flex-1 flex items-center justify-center min-h-[400px] order-1 lg:order-2 overflow-hidden">
          <svg
            width="100%"
            height="100%"
            viewBox="-200 -200 400 400"
            className="border border-border rounded-lg bg-background"
          >
            {/* Grid */}
            <g opacity="0.2">
              {[-150, -100, -50, 0, 50, 100, 150].map((pos) => (
                <g key={pos}>
                  <line
                    x1={pos}
                    y1="-200"
                    x2={pos}
                    y2="200"
                    stroke="currentColor"
                    strokeWidth="0.5"
                  />
                  <line
                    x1="-200"
                    y1={pos}
                    x2="200"
                    y2={pos}
                    stroke="currentColor"
                    strokeWidth="0.5"
                  />
                </g>
              ))}
            </g>

            {/* World frame axes */}
            <g>
              <line
                x1="0"
                y1="0"
                x2="80"
                y2="0"
                stroke="rgb(59, 130, 246)"
                strokeWidth="3"
                markerEnd="url(#arrowBlue)"
              />
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="-80"
                stroke="rgb(59, 130, 246)"
                strokeWidth="3"
                markerEnd="url(#arrowBlue)"
              />
              <text x="85" y="5" fontSize="14" fill="rgb(59, 130, 246)" fontWeight="bold">
                Xw
              </text>
              <text x="5" y="-85" fontSize="14" fill="rgb(59, 130, 246)" fontWeight="bold">
                Yw
              </text>
            </g>

            {/* Local frame axes */}
            <motion.g
              animate={{
                transform: `translate(${localOriginWorld.x}px, ${localOriginWorld.y}px)`,
              }}
              transition={{ duration: 0.3 }}
            >
              <motion.line
                x1="0"
                y1="0"
                x2={localXAxisEnd.x - localOriginWorld.x}
                y2={localXAxisEnd.y - localOriginWorld.y}
                stroke="rgb(34, 197, 94)"
                strokeWidth="3"
                markerEnd="url(#arrowGreen)"
              />
              <motion.line
                x1="0"
                y1="0"
                x2={localYAxisEnd.x - localOriginWorld.x}
                y2={localYAxisEnd.y - localOriginWorld.y}
                stroke="rgb(34, 197, 94)"
                strokeWidth="3"
                markerEnd="url(#arrowGreen)"
              />
              <motion.circle
                cx="0"
                cy="0"
                r="5"
                fill="rgb(34, 197, 94)"
              />
            </motion.g>

            {/* Labels for local axes */}
            <motion.text
              x={localXAxisEnd.x + 5}
              y={localXAxisEnd.y + 5}
              fontSize="14"
              fill="rgb(34, 197, 94)"
              fontWeight="bold"
              animate={{
                x: localXAxisEnd.x + 5,
                y: localXAxisEnd.y + 5,
              }}
              transition={{ duration: 0.3 }}
            >
              Xl
            </motion.text>
            <motion.text
              x={localYAxisEnd.x + 5}
              y={localYAxisEnd.y + 5}
              fontSize="14"
              fill="rgb(34, 197, 94)"
              fontWeight="bold"
              animate={{
                x: localYAxisEnd.x + 5,
                y: localYAxisEnd.y + 5,
              }}
              transition={{ duration: 0.3 }}
            >
              Yl
            </motion.text>

            {/* Point */}
            <motion.circle
              cx={worldPoint.x}
              cy={worldPoint.y}
              r="6"
              fill="rgb(239, 68, 68)"
              animate={{
                cx: worldPoint.x,
                cy: worldPoint.y,
              }}
              transition={{ duration: 0.3 }}
            />
            <motion.text
              x={worldPoint.x + 10}
              y={worldPoint.y - 10}
              fontSize="12"
              fill="rgb(239, 68, 68)"
              fontWeight="bold"
              animate={{
                x: worldPoint.x + 10,
                y: worldPoint.y - 10,
              }}
              transition={{ duration: 0.3 }}
            >
              P
            </motion.text>

            {/* Arrow markers */}
            <defs>
              <marker
                id="arrowBlue"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0,0 L0,6 L9,3 z" fill="rgb(59, 130, 246)" />
              </marker>
              <marker
                id="arrowGreen"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0,0 L0,6 L9,3 z" fill="rgb(34, 197, 94)" />
              </marker>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
}
