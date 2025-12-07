"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { RotateCcw } from "lucide-react";

interface Rotation2DScaleVisualizationProps {
  speed: number;
}

interface Point {
  x: number;
  y: number;
}

export default function Rotation2DScaleVisualization({
  speed,
}: Rotation2DScaleVisualizationProps) {
  const [angle, setAngle] = useState(0);
  const [scale, setScale] = useState(1);
  const [showOriginal, setShowOriginal] = useState(true);

  // Original square vertices (centered at origin)
  const originalSquare: Point[] = [
    { x: -40, y: -40 },
    { x: 40, y: -40 },
    { x: 40, y: 40 },
    { x: -40, y: 40 },
  ];

  // Apply 2D transformation: rotation then scale
  const transformPoint = (p: Point): Point => {
    const rad = (angle * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    // Rotation matrix
    const rotatedX = p.x * cos - p.y * sin;
    const rotatedY = p.x * sin + p.y * cos;

    // Scale
    return {
      x: rotatedX * scale,
      y: rotatedY * scale,
    };
  };

  const transformedSquare = originalSquare.map(transformPoint);

  // Create path string for polygon
  const createPath = (points: Point[]) => {
    return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
  };

  const reset = () => {
    setAngle(0);
    setScale(1);
  };

  // Transformation matrix
  const rad = (angle * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const matrix = [
    [cos * scale, -sin * scale],
    [sin * scale, cos * scale],
  ];

  return (
    <div className="h-full flex flex-col p-2 sm:p-0">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-2 text-foreground">
          2D Rotation & Scale
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Visualize 2D rotation and scaling transformations using transformation matrices.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 flex-1">
        {/* Controls */}
        <div className="w-full lg:w-80 space-y-4 order-2 lg:order-1">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Rotation Angle: {angle}°
            </label>
            <Slider
              value={[angle]}
              onValueChange={(v) => setAngle(v[0])}
              min={0}
              max={360}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Scale Factor: {scale.toFixed(2)}
            </label>
            <Slider
              value={[scale]}
              onValueChange={(v) => setScale(v[0])}
              min={0.1}
              max={2}
              step={0.1}
              className="w-full"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={reset} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showOriginal"
              checked={showOriginal}
              onChange={(e) => setShowOriginal(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="showOriginal" className="text-sm font-medium">
              Show Original Shape
            </label>
          </div>

          <div className="pt-4 border-t">
            <div className="text-sm space-y-2">
              <div className="flex items-center justify-between">
                <span>Angle:</span>
                <Badge variant="secondary">{angle}°</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Scale:</span>
                <Badge variant="secondary">{scale.toFixed(2)}x</Badge>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-semibold mb-2">Transformation Matrix</h3>
              <div className="bg-muted p-3 rounded-lg font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span>[</span>
                  <div className="flex flex-col gap-1">
                    <div className="flex gap-2">
                      <span className="w-16 text-right">{matrix[0][0].toFixed(2)}</span>
                      <span className="w-16 text-right">{matrix[0][1].toFixed(2)}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="w-16 text-right">{matrix[1][0].toFixed(2)}</span>
                      <span className="w-16 text-right">{matrix[1][1].toFixed(2)}</span>
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
                  Original Shape
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-muted-foreground font-medium">
                  Transformed Shape
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

            {/* Axes */}
            <line
              x1="-200"
              y1="0"
              x2="200"
              y2="0"
              stroke="currentColor"
              strokeWidth="2"
              opacity="0.5"
            />
            <line
              x1="0"
              y1="-200"
              x2="0"
              y2="200"
              stroke="currentColor"
              strokeWidth="2"
              opacity="0.5"
            />

            {/* Axis labels */}
            <text x="180" y="-10" fontSize="12" fill="currentColor">
              X
            </text>
            <text x="10" y="-180" fontSize="12" fill="currentColor">
              Y
            </text>

            {/* Original square */}
            {showOriginal && (
              <motion.path
                d={createPath(originalSquare)}
                fill="rgba(59, 130, 246, 0.3)"
                stroke="rgb(59, 130, 246)"
                strokeWidth="2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              />
            )}

            {/* Transformed square */}
            <motion.path
              d={createPath(transformedSquare)}
              fill="rgba(34, 197, 94, 0.3)"
              stroke="rgb(34, 197, 94)"
              strokeWidth="2"
              animate={{
                d: createPath(transformedSquare),
              }}
              transition={{ duration: 0.3 }}
            />

            {/* Vertices */}
            {transformedSquare.map((point, i) => (
              <motion.circle
                key={i}
                cx={point.x}
                cy={point.y}
                r="4"
                fill="rgb(34, 197, 94)"
                animate={{
                  cx: point.x,
                  cy: point.y,
                }}
                transition={{ duration: 0.3 }}
              />
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}
