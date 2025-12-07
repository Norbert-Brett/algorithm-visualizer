"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { RotateCcw } from "lucide-react";

interface Rotation3DScaleVisualizationProps {
  speed: number;
}

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface Point2D {
  x: number;
  y: number;
}

export default function Rotation3DScaleVisualization({
  speed,
}: Rotation3DScaleVisualizationProps) {
  const [rotX, setRotX] = useState(20);
  const [rotY, setRotY] = useState(30);
  const [rotZ, setRotZ] = useState(0);
  const [scale, setScale] = useState(1);

  const reset = () => {
    setRotX(20);
    setRotY(30);
    setRotZ(0);
    setScale(1);
  };

  // Cube vertices (centered at origin)
  const cubeVertices: Point3D[] = [
    { x: -50, y: -50, z: -50 }, // 0
    { x: 50, y: -50, z: -50 },  // 1
    { x: 50, y: 50, z: -50 },   // 2
    { x: -50, y: 50, z: -50 },  // 3
    { x: -50, y: -50, z: 50 },  // 4
    { x: 50, y: -50, z: 50 },   // 5
    { x: 50, y: 50, z: 50 },    // 6
    { x: -50, y: 50, z: 50 },   // 7
  ];

  // Cube edges
  const cubeEdges = [
    [0, 1], [1, 2], [2, 3], [3, 0], // Back face
    [4, 5], [5, 6], [6, 7], [7, 4], // Front face
    [0, 4], [1, 5], [2, 6], [3, 7], // Connecting edges
  ];

  // Apply 3D transformations
  const transformPoint = (p: Point3D): Point3D => {
    const radX = (rotX * Math.PI) / 180;
    const radY = (rotY * Math.PI) / 180;
    const radZ = (rotZ * Math.PI) / 180;

    // Rotation around X axis
    let x = p.x;
    let y = p.y * Math.cos(radX) - p.z * Math.sin(radX);
    let z = p.y * Math.sin(radX) + p.z * Math.cos(radX);

    // Rotation around Y axis
    const tempX = x * Math.cos(radY) + z * Math.sin(radY);
    z = -x * Math.sin(radY) + z * Math.cos(radY);
    x = tempX;

    // Rotation around Z axis
    const tempX2 = x * Math.cos(radZ) - y * Math.sin(radZ);
    y = x * Math.sin(radZ) + y * Math.cos(radZ);
    x = tempX2;

    // Apply scale
    return {
      x: x * scale,
      y: y * scale,
      z: z * scale,
    };
  };

  // Simple perspective projection
  const project = (p: Point3D): Point2D => {
    const distance = 400;
    const factor = distance / (distance + p.z);
    return {
      x: p.x * factor,
      y: p.y * factor,
    };
  };

  const transformedVertices = cubeVertices.map(transformPoint);
  const projectedVertices = transformedVertices.map(project);

  // Calculate transformation matrices
  const radX = (rotX * Math.PI) / 180;
  const radY = (rotY * Math.PI) / 180;
  const radZ = (rotZ * Math.PI) / 180;

  const cosX = Math.cos(radX);
  const sinX = Math.sin(radX);
  const cosY = Math.cos(radY);
  const sinY = Math.sin(radY);
  const cosZ = Math.cos(radZ);
  const sinZ = Math.sin(radZ);

  // Combined rotation matrix (Z * Y * X) with scale
  const matrix = [
    [
      (cosY * cosZ) * scale,
      (cosZ * sinX * sinY - cosX * sinZ) * scale,
      (cosX * cosZ * sinY + sinX * sinZ) * scale,
    ],
    [
      (cosY * sinZ) * scale,
      (cosX * cosZ + sinX * sinY * sinZ) * scale,
      (cosX * sinY * sinZ - cosZ * sinX) * scale,
    ],
    [
      -sinY * scale,
      (cosY * sinX) * scale,
      (cosX * cosY) * scale,
    ],
  ];

  return (
    <div className="h-full flex flex-col p-2 sm:p-0">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-2 text-foreground">
          3D Rotation & Scale
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Visualize 3D rotation and scaling transformations on a cube.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 flex-1">
        {/* Controls */}
        <div className="w-full lg:w-80 space-y-4 order-2 lg:order-1">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Rotation X: {rotX}°
            </label>
            <Slider
              value={[rotX]}
              onValueChange={(v) => setRotX(v[0])}
              min={0}
              max={360}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Rotation Y: {rotY}°
            </label>
            <Slider
              value={[rotY]}
              onValueChange={(v) => setRotY(v[0])}
              min={0}
              max={360}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Rotation Z: {rotZ}°
            </label>
            <Slider
              value={[rotZ]}
              onValueChange={(v) => setRotZ(v[0])}
              min={0}
              max={360}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Scale: {scale.toFixed(2)}
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

          <div className="pt-4 border-t">
            <div className="text-sm space-y-2">
              <div className="flex items-center justify-between">
                <span>Rotation:</span>
                <Badge variant="secondary">
                  ({rotX}°, {rotY}°, {rotZ}°)
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Scale:</span>
                <Badge variant="secondary">{scale.toFixed(2)}x</Badge>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-semibold mb-2">
                Transformation Matrix
              </h3>
              <div className="bg-muted p-3 rounded-lg font-mono text-[10px]">
                <div className="flex items-center gap-1">
                  <span>[</span>
                  <div className="flex flex-col gap-1">
                    {matrix.map((row, i) => (
                      <div key={i} className="flex gap-1">
                        {row.map((val, j) => (
                          <span key={j} className="w-14 text-right">
                            {val.toFixed(2)}
                          </span>
                        ))}
                      </div>
                    ))}
                  </div>
                  <span>]</span>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-muted-foreground font-medium">
                  Cube Edges
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-muted-foreground font-medium">
                  Vertices
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
            {/* Reference grid */}
            <g opacity="0.1">
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

            {/* Cube edges */}
            {cubeEdges.map((edge, i) => {
              const start = projectedVertices[edge[0]];
              const end = projectedVertices[edge[1]];
              const startZ = transformedVertices[edge[0]].z;
              const endZ = transformedVertices[edge[1]].z;
              const avgZ = (startZ + endZ) / 2;
              const opacity = 0.3 + (avgZ + 100) / 400; // Depth-based opacity

              return (
                <motion.line
                  key={i}
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  stroke="rgb(59, 130, 246)"
                  strokeWidth="2"
                  opacity={opacity}
                  animate={{
                    x1: start.x,
                    y1: start.y,
                    x2: end.x,
                    y2: end.y,
                    opacity: opacity,
                  }}
                  transition={{ duration: 0.3 }}
                />
              );
            })}

            {/* Vertices */}
            {projectedVertices.map((point, i) => {
              const z = transformedVertices[i].z;
              const size = 4 + (z + 100) / 50; // Depth-based size
              const opacity = 0.5 + (z + 100) / 400;

              return (
                <motion.circle
                  key={i}
                  cx={point.x}
                  cy={point.y}
                  r={size}
                  fill="rgb(34, 197, 94)"
                  opacity={opacity}
                  animate={{
                    cx: point.x,
                    cy: point.y,
                    r: size,
                    opacity: opacity,
                  }}
                  transition={{ duration: 0.3 }}
                />
              );
            })}

            {/* Axes indicators */}
            <g opacity="0.5">
              <line x1="-180" y1="180" x2="-140" y2="180" stroke="red" strokeWidth="2" />
              <text x="-135" y="185" fontSize="10" fill="red">X</text>
              
              <line x1="-180" y1="180" x2="-180" y2="140" stroke="green" strokeWidth="2" />
              <text x="-178" y="135" fontSize="10" fill="green">Y</text>
              
              <line x1="-180" y1="180" x2="-160" y2="160" stroke="blue" strokeWidth="2" />
              <text x="-155" y="158" fontSize="10" fill="blue">Z</text>
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}
