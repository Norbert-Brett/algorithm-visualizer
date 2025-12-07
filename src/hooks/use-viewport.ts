import { useState, useEffect } from "react";

export type ViewportSize = "mobile" | "tablet" | "desktop";

export interface ViewportDimensions {
  width: number;
  height: number;
  size: ViewportSize;
}

const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
} as const;

/**
 * Hook to detect current viewport size and dimensions
 * Returns viewport width, height, and size category (mobile/tablet/desktop)
 */
export function useViewport(): ViewportDimensions {
  const [viewport, setViewport] = useState<ViewportDimensions>({
    width: typeof window !== "undefined" ? window.innerWidth : 1024,
    height: typeof window !== "undefined" ? window.innerHeight : 768,
    size: "desktop",
  });

  useEffect(() => {
    const getViewportSize = (width: number): ViewportSize => {
      if (width < BREAKPOINTS.mobile) return "mobile";
      if (width < BREAKPOINTS.tablet) return "tablet";
      return "desktop";
    };

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setViewport({
        width,
        height,
        size: getViewportSize(width),
      });
    };

    // Set initial value
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return viewport;
}

/**
 * Hook to check if viewport is mobile size
 */
export function useIsMobile(): boolean {
  const { size } = useViewport();
  return size === "mobile";
}

/**
 * Hook to check if viewport is tablet size
 */
export function useIsTablet(): boolean {
  const { size } = useViewport();
  return size === "tablet";
}

/**
 * Hook to check if viewport is desktop size
 */
export function useIsDesktop(): boolean {
  const { size } = useViewport();
  return size === "desktop";
}
