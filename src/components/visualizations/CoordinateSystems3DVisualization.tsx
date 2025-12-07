"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { RotateCcw } from "lucide-react";

interface CoordinateSystems3DVisualizationProps {
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

export default function CoordinateSystems3DVisualization({
  speed,
}: CoordinateSystems3DVisualizationProps) {
  const [localX, setLocalX] = useState(30);
  const [localY, setLocalY] = useState(20);
  const [localZ, setLocalZ] = useState(10);
  const [localRotX, setLocalRotX] = useState(0);
  const [localRotY, setLocalRotY] = useState(30);
  const [localRotZ, setLocalRotZ] = useState(0);
  const [pointLocalX, setPointLocalX] = useState(20);
  const [pointLocalY, setPointLocalY] = useState(15);
  const [pointLocalZ, setPointLocalZ] = useState(10);
  const [viewRotX, setViewRotX] = useState(20);
  const [viewRotY, setViewRotY] = useState(30);

  const reset = () => {
    setLocalX(30);
    setLocalY(20);
    setLocalZ(10);
    setLocalRotX(0);
    setLocalRotY(30);
    setLocalRotZ(0);
    setPointLocalX(20);
    setPointLocalY(15);
    setPointLocalZ(10);
    setViewRotX(20);
    setViewRotY(30);
  };

  // Transform point from local to world coordinates
  const localToWorld = (p: Point3D): Point3D => {
    const radX = (localRotX * Math.PI) / 180;
    const radY = (localRotY * Math.PI) / 180;
    const radZ = (localRotZ * Math.PI) / 180;

    // Rotation around X axis
    let x = p.x;
    let y = p.y * Math.cos(radX) - p.z * Math.sin(radX);
    let z = p.y * Math.sin(radX) + p.z * Math.cos(radX);

    // Rotation around Y axis
    let tempX = x * Math.cos(radY) + z * Math.sin(radY);
    z = -x * Math.sin(radY) + z * Math.cos(radY);
    x = tempX;

    // Rotation around Z axis
    tempX = x * Math.cos(radZ) - y * Math.sin(radZ);
    y = x * Math.sin(radZ) + y * Math.cos(radZ);
    x = tempX;

    // Translation
    return {
      x: x + localX,
      y: y + localY,
      z: z + localZ,
    };
  };

  // Apply view rotation for visualization
  const applyViewRotation = (p: Point3D): Point3D => {
    const radX = (viewRotX * Math.PI) / 180;
    const radY = (viewRotY * Math.PI) / 180;

    // Rotation around X axis
    let x = p.x;
    const y = p.y * Math.cos(radX) - p.z * Math.sin(radX);
    let z = p.y * Math.sin(radX) + p.z * Math.cos(radX);

    // Rotation around Y axis
    const tempX = x * Math.cos(radY) + z * Math.sin(radY);
    z = -x * Math.sin(radY) + z * Math.cos(radY);
    x = tempX;

    return { x, y, z };
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

  // Calculate point in both coordinate systems
  const pointLocal = { x: pointLocalX, y: pointLocalY, z: pointLocalZ };
  const pointWorld = localToWorld(pointLocal);

  // World frame axes
  const worldAxes = [
    { start: { x: 0, y: 0, z: 0 }, end: { x: 60, y: 0, z: 0 }, color: "rgb(239, 68, 68)", label: "Xw" },
    { start: { x: 0, y: 0, z: 0 }, end: { x: 0, y: 60, z: 0 }, color: "rgb(34, 197, 94)", label: "Yw" },
    { start: { x: 0, y: 0, z: 0 }, end: { x: 0, y: 0, z: 60 }, color: "rgb(59, 130, 246)", label: "Zw" },
  ];

  // Local frame axes in world coordinates
  const localOrigin = { x: localX, y: localY, z: localZ };
  const localAxes = [
    { start: localOrigin, end: localToWorld({ x: 40, y: 0, z: 0 }), color: "rgb(252, 165, 165)", label: "Xl" },
    { start: localOrigin, end: localToWorld({ x: 0, y: 40, z: 0 }), color: "rgb(134, 239, 172)", label: "Yl" },
    { start: localOrigin, end: localToWorld({ x: 0, y: 0, z: 40 }), color: "rgb(147, 197, 253)", label: "Zl" },
  ];

  // Apply view rotation and project all points
  const projectAxis = (axis: typeof worldAxes[0]) => {
    const startRotated = applyViewRotation(axis.start);
    const endRotated = applyViewRotation(axis.end);
    return {
      start: project(startRotated),
      end: project(endRotated),
      endRotated,
      color: axis.color,
      label: axis.label,
    };
  };

  const projectedWorldAxes = worldAxes.map(projectAxis);
  const projectedLocalAxes = localAxes.map(projectAxis);
  const projectedPoint = project(applyViewRotation(pointWorld));

  // Transformation matrix
  const radX = (localRotX * Math.PI) / 180;
  const radY = (localRotY * Math.PI) / 180;
  const radZ = (localRotZ * Math.PI) / 180;

  const cosX = Math.cos(radX);
  const sinX = Math.sin(radX);
  const cosY = Math.cos(radY);
  const sinY = Math.sin(radY);
  const cosZ = Math.cos(radZ);
  const sinZ = Math.sin(radZ);

  const matrix = [
    [cosY * cosZ, cosZ * sinX * sinY - cosX * sinZ, cosX * cosZ * sinY + sinX * sinZ, localX],
    [cosY * sinZ, cosX * cosZ + sinX * sinY * sinZ, cosX * sinY * sinZ - cosZ * sinX, localY],
    [-sinY, cosY * sinX, cosX * cosY, localZ],
    [0, 0, 0, 1],
  ];

  return (
    <div className="h-full flex flex-col p-2 sm:p-0">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-2 text-foreground">
          3D Coordinate Systems
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Visualize transformations between world and local coordinate frames in 3D.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 flex-1">
        {/* Controls */}
        <div className="w-full lg:w-80 space-y-4 order-2 lg:order-1 overflow-y-auto max-h-[600px]">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">View Rotation</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium">View X: {viewRotX}°</label>
              <Slider
                value={[viewRotX]}
                onValueChange={(v) => setViewRotX(v[0])}
                min={0}
                max={360}
                step={1}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">View Y: {viewRotY}°</label>
              <Slider
                value={[viewRotY]}
                onValueChange={(v) => setViewRotY(v[0])}
                min={0}
                max={360}
                step={1}
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t">
            <h3 className="text-sm font-semibold">Local Frame Position</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium">X: {localX}</label>
              <Slider
                value={[localX]}
                onValueChange={(v) => setLocalX(v[0])}
                min={-50}
                max={50}
                step={5}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Y: {localY}</label>
              <Slider
                value={[localY]}
                onValueChange={(v) => setLocalY(v[0])}
                min={-50}
                max={50}
                step={5}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Z: {localZ}</label>
              <Slider
                value={[localZ]}
                onValueChange={(v) => setLocalZ(v[0])}
                min={-50}
                max={50}
                step={5}
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t">
            <h3 className="text-sm font-semibold">Local Frame Rotation</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium">Rot X: {localRotX}°</label>
              <Slider
                value={[localRotX]}
                onValueChange={(v) => setLocalRotX(v[0])}
                min={0}
                max={360}
                step={1}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Rot Y: {localRotY}°</label>
              <Slider
                value={[localRotY]}
                onValueChange={(v) => setLocalRotY(v[0])}
                min={0}
                max={360}
                step={1}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Rot Z: {localRotZ}°</label>
              <Slider
                value={[localRotZ]}
                onValueChange={(v) => setLocalRotZ(v[0])}
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
              <label className="text-sm font-medium">Local X: {pointLocalX}</label>
              <Slider
                value={[pointLocalX]}
                onValueChange={(v) => setPointLocalX(v[0])}
                min={-30}
                max={30}
                step={5}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Local Y: {pointLocalY}</label>
              <Slider
                value={[pointLocalY]}
                onValueChange={(v) => setPointLocalY(v[0])}
                min={-30}
                max={30}
                step={5}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Local Z: {pointLocalZ}</label>
              <Slider
                value={[pointLocalZ]}
                onValueChange={(v) => setPointLocalZ(v[0])}
                min={-30}
                max={30}
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
                <Badge variant="secondary" className="text-xs">
                  ({pointLocalX}, {pointLocalY}, {pointLocalZ})
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>World:</span>
                <Badge variant="default" className="text-xs">
                  ({pointWorld.x.toFixed(1)}, {pointWorld.y.toFixed(1)}, {pointWorld.z.toFixed(1)})
                </Badge>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-semibold mb-2">Transform Matrix</h3>
              <div className="bg-muted p-2 rounded-lg font-mono text-[9px]">
                <div className="flex items-center gap-1">
                  <span>[</span>
                  <div className="flex flex-col gap-0.5">
                    {matrix.map((row, i) => (
                      <div key={i} className="flex gap-1">
                        {row.map((val, j) => (
                          <span key={j} className="w-11 text-right">
                            {val.toFixed(1)}
                          </span>
                        ))}
                      </div>
                    ))}
                  </div>
                  <span>]</span>
                </div>
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
            {/* World frame axes */}
            {projectedWorldAxes.map((axis, i) => (
              <g key={`world-${i}`}>
                <motion.line
                  x1={axis.start.x}
                  y1={axis.start.y}
                  x2={axis.end.x}
                  y2={axis.end.y}
                  stroke={axis.color}
                  strokeWidth="3"
                  animate={{
                    x1: axis.start.x,
                    y1: axis.start.y,
                    x2: axis.end.x,
                    y2: axis.end.y,
                  }}
                  transition={{ duration: 0.3 }}
                />
                <motion.text
                  x={axis.end.x + 10}
                  y={axis.end.y + 5}
                  fontSize="12"
                  fill={axis.color}
                  fontWeight="bold"
                  animate={{
                    x: axis.end.x + 10,
                    y: axis.end.y + 5,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {axis.label}
                </motion.text>
              </g>
            ))}

            {/* Local frame axes */}
            {projectedLocalAxes.map((axis, i) => (
              <g key={`local-${i}`}>
                <motion.line
                  x1={axis.start.x}
                  y1={axis.start.y}
                  x2={axis.end.x}
                  y2={axis.end.y}
                  stroke={axis.color}
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  animate={{
                    x1: axis.start.x,
                    y1: axis.start.y,
                    x2: axis.end.x,
                    y2: axis.end.y,
                  }}
                  transition={{ duration: 0.3 }}
                />
                <motion.text
                  x={axis.end.x + 10}
                  y={axis.end.y + 5}
                  fontSize="12"
                  fill={axis.color}
                  fontWeight="bold"
                  animate={{
                    x: axis.end.x + 10,
                    y: axis.end.y + 5,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {axis.label}
                </motion.text>
              </g>
            ))}

            {/* Point */}
            <motion.circle
              cx={projectedPoint.x}
              cy={projectedPoint.y}
              r="6"
              fill="rgb(168, 85, 247)"
              animate={{
                cx: projectedPoint.x,
                cy: projectedPoint.y,
              }}
              transition={{ duration: 0.3 }}
            />
            <motion.text
              x={projectedPoint.x + 10}
              y={projectedPoint.y - 10}
              fontSize="12"
              fill="rgb(168, 85, 247)"
              fontWeight="bold"
              animate={{
                x: projectedPoint.x + 10,
                y: projectedPoint.y - 10,
              }}
              transition={{ duration: 0.3 }}
            >
              P
            </motion.text>
          </svg>
        </div>
      </div>
    </div>
  );
}
