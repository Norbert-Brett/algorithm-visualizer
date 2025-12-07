"use client";

import { ReactNode, useRef } from "react";
import { useViewport } from "@/hooks/use-viewport";
import { useOverflowDetection } from "@/hooks/use-overflow-detection";
import { cn } from "@/lib/utils";

interface ResponsiveVisualizationContainerProps {
  children: ReactNode;
  title: string;
  description: string;
  controls: ReactNode;
  visualization: ReactNode;
  className?: string;
}

/**
 * Responsive container for visualizations
 * Handles flex-col on mobile, flex-row on desktop
 * Provides overflow detection and scrolling
 */
export function ResponsiveVisualizationContainer({
  children,
  title,
  description,
  controls,
  visualization,
  className,
}: ResponsiveVisualizationContainerProps) {
  const { size } = useViewport();
  const visualizationRef = useRef<HTMLDivElement>(null!);
  const overflow = useOverflowDetection(visualizationRef);

  const isMobileOrTablet = size === "mobile" || size === "tablet";

  return (
    <div className={cn("h-full flex flex-col p-2 sm:p-0", className)}>
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-2 text-foreground">
          {title}
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          {description}
        </p>
      </div>

      {/* Main Content */}
      <div
        className={cn(
          "flex gap-4 lg:gap-6 flex-1",
          isMobileOrTablet ? "flex-col" : "flex-row"
        )}
      >
        {/* Controls */}
        <div
          className={cn(
            "space-y-4",
            isMobileOrTablet ? "w-full order-2" : "w-80 order-1"
          )}
        >
          {controls}
        </div>

        {/* Visualization */}
        <div
          ref={visualizationRef}
          className={cn(
            "flex-1 min-h-[300px]",
            isMobileOrTablet ? "order-1" : "order-2",
            overflow.horizontal ? "overflow-x-auto" : "overflow-x-hidden",
            overflow.vertical ? "overflow-y-auto" : "overflow-y-hidden"
          )}
        >
          {visualization}
        </div>
      </div>

      {children}
    </div>
  );
}
