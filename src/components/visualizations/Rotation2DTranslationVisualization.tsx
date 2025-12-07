"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { RotateCcw } from "lucide-react";

interface Rotation2DTranslationVisualizationProps {
  speed: number;
}

interface Point {
  x: number;
  y: number;
}

export default function Rotation2DTranslationVisualization({
  speed,
}: Rotation2DTranslationVisualizationProps) {
  const [angle, setAngle] = useState(0);
  const [dx, setDx] = useState(0);
  const [dy, setDy] = useState(0);
  const [showOriginal, setShowOriginal] = useState(true);
  const [showIntermediate, setShowIntermediate] = useState(true);

  // Original triangle vertices (centered at origin)
  const originalTriangle: Point[] = [
    { x: 0, y: -50 },
    { x: -40, y: 40 },
    { x: 40, y: 40 },
  ];

  // Apply rotation first
  const rotatePoint = (p: Point): Point => {
    const rad = (angle * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    return {
      x: p.x * cos - p.y * sin,
      y: p.x * sin + p.y * cos,
    };
  };

  // Apply translation
  const translatePoint = (p: Point): Point => {
    return {
      x: p.x + dx,
      y: p.y + dy,
    };
  };

  const rotatedTriangle = originalTriangle.map(rotatePoint);
  const transformedTriangle = rotatedTriangle.map(translatePoint);

  // Create path string for polygon
  const createPath = (points: Point[]) => {
    return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
  };

  const reset = () => {
    setAngle(0);
    setDx(0);
    setDy(0);
  };

  // Homogeneous transformation matrix (3x3)
  const rad = (angle * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const matrix = [
    [cos, -sin, dx],
    [sin, cos, dy],
    [0, 0, 1],
  ];

  return (
    <div className="h-full flex flex-col p-2 sm:p-0">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-2 text-foreground">
          2D Rotation & Translation
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Visualize 2D rotation followed by translation using homogeneous coordinates.
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
              Translation X: {dx}
            </label>
            <Slider
              value={[dx]}
              onValueChange={(v) => setDx(v[0])}
              min={-100}
              max={100}
              step={5}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Translation Y: {dy}
            </label>
            <Slider
              value={[dy]}
              onValueChange={(v) => setDy(v[0])}
              min={-100}
              max={100}
              step={5}
              className="w-full"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={reset} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>

          <div className="space-y-2">
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
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showIntermediate"
                checked={showIntermediate}
                onChange={(e) => setShowIntermediate(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="showIntermediate" className="text-sm font-medium">
                Show After Rotation
              </label>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="text-sm space-y-2">
              <div className="flex items-center justify-between">
                <span>Angle:</span>
                <Badge variant="secondary">{angle}°</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Translation:</span>
                <Badge variant="secondary">({dx}, {dy})</Badge>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-semibold mb-2">Transformation Matrix</h3>
              <div className="bg-muted p-3 rounded-lg font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span>[</span>
                  <div className="flex flex-col gap-1">
                    <div className="flex gap-2">
                      <span className="w-12 text-right">{matrix[0][0].toFixed(2)}</span>
                      <span className="w-12 text-right">{matrix[0][1].toFixed(2)}</span>
                      <span className="w-12 text-right">{matrix[0][2].toFixed(0)}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="w-12 text-right">{matrix[1][0].toFixed(2)}</span>
                      <span className="w-12 text-right">{matrix[1][1].toFixed(2)}</span>
                      <span className="w-12 text-right">{matrix[1][2].toFixed(0)}</span>
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
                  Original
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span className="text-muted-foreground font-medium">
                  After Rotation
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-muted-foreground font-medium">
                  After Translation
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

            {/* Original triangle */}
            {showOriginal && (
              <motion.path
                d={createPath(originalTriangle)}
                fill="rgba(59, 130, 246, 0.3)"
                stroke="rgb(59, 130, 246)"
                strokeWidth="2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              />
            )}

            {/* Rotated triangle (intermediate) */}
            {showIntermediate && (angle !== 0 || dx !== 0 || dy !== 0) && (
              <motion.path
                d={createPath(rotatedTriangle)}
                fill="rgba(234, 179, 8, 0.3)"
                stroke="rgb(234, 179, 8)"
                strokeWidth="2"
                strokeDasharray="5,5"
                animate={{
                  d: createPath(rotatedTriangle),
                }}
                transition={{ duration: 0.3 }}
              />
            )}

            {/* Transformed triangle (final) */}
            <motion.path
              d={createPath(transformedTriangle)}
              fill="rgba(34, 197, 94, 0.3)"
              stroke="rgb(34, 197, 94)"
              strokeWidth="2"
              animate={{
                d: createPath(transformedTriangle),
              }}
              transition={{ duration: 0.3 }}
            />

            {/* Vertices */}
            {transformedTriangle.map((point, i) => (
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
