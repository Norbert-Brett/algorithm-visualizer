/**
 * Responsive utility functions for calculating dimensions and layouts
 */

export interface ResponsiveDimensions {
  nodeSize: number;
  nodeSpacing: number;
  fontSize: number;
  padding: number;
  svgWidth: number;
  svgHeight: number;
}

/**
 * Calculate responsive dimensions based on viewport width
 * @param viewportWidth - Current viewport width in pixels
 * @returns Object with responsive dimension values
 */
export function calculateResponsiveDimensions(
  viewportWidth: number
): ResponsiveDimensions {
  // Mobile: < 768px
  if (viewportWidth < 768) {
    return {
      nodeSize: 24,
      nodeSpacing: 40,
      fontSize: 10,
      padding: 8,
      svgWidth: Math.min(viewportWidth - 32, 600),
      svgHeight: 300,
    };
  }

  // Tablet: 768px - 1023px
  if (viewportWidth < 1024) {
    return {
      nodeSize: 32,
      nodeSpacing: 60,
      fontSize: 12,
      padding: 12,
      svgWidth: Math.min(viewportWidth - 64, 800),
      svgHeight: 400,
    };
  }

  // Desktop: >= 1024px
  return {
    nodeSize: 40,
    nodeSpacing: 80,
    fontSize: 14,
    padding: 16,
    svgWidth: Math.min(viewportWidth - 400, 1000),
    svgHeight: 500,
  };
}

/**
 * Calculate responsive bar width for sorting visualizations
 * @param arrayLength - Number of elements in array
 * @param viewportWidth - Current viewport width
 * @returns Bar width in pixels
 */
export function calculateBarWidth(
  arrayLength: number,
  viewportWidth: number
): number {
  const availableWidth = viewportWidth < 768 ? viewportWidth - 32 : viewportWidth - 400;
  const maxBarWidth = viewportWidth < 768 ? 32 : 48;
  const minBarWidth = 8;
  const gap = 4;

  const calculatedWidth = (availableWidth - gap * (arrayLength - 1)) / arrayLength;
  return Math.max(minBarWidth, Math.min(maxBarWidth, calculatedWidth));
}

/**
 * Calculate responsive graph node positions
 * @param nodeCount - Number of nodes in graph
 * @param viewportWidth - Current viewport width
 * @param viewportHeight - Current viewport height
 * @returns Array of {x, y} positions
 */
export function calculateGraphLayout(
  nodeCount: number,
  viewportWidth: number,
  viewportHeight: number
): Array<{ x: number; y: number }> {
  const positions: Array<{ x: number; y: number }> = [];
  
  // Calculate available space
  const padding = viewportWidth < 768 ? 40 : 80;
  const width = Math.min(viewportWidth - padding * 2, 800);
  const height = Math.min(viewportHeight - padding * 2, 600);

  // Arrange nodes in a circle
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.35;

  for (let i = 0; i < nodeCount; i++) {
    const angle = (2 * Math.PI * i) / nodeCount - Math.PI / 2;
    positions.push({
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    });
  }

  return positions;
}

/**
 * Calculate responsive tree node positions
 * @param depth - Depth of the tree
 * @param viewportWidth - Current viewport width
 * @returns Object with horizontal and vertical spacing
 */
export function calculateTreeSpacing(
  depth: number,
  viewportWidth: number
): { horizontal: number; vertical: number } {
  const isMobile = viewportWidth < 768;
  const isTablet = viewportWidth >= 768 && viewportWidth < 1024;

  if (isMobile) {
    return {
      horizontal: Math.max(30, 120 / Math.pow(2, depth - 1)),
      vertical: 50,
    };
  }

  if (isTablet) {
    return {
      horizontal: Math.max(40, 160 / Math.pow(2, depth - 1)),
      vertical: 70,
    };
  }

  return {
    horizontal: Math.max(50, 200 / Math.pow(2, depth - 1)),
    vertical: 90,
  };
}

/**
 * Get responsive SVG viewBox for scalable visualizations
 * @param contentWidth - Width of content to display
 * @param contentHeight - Height of content to display
 * @param viewportWidth - Current viewport width
 * @returns viewBox string for SVG
 */
export function getResponsiveViewBox(
  contentWidth: number,
  contentHeight: number,
  viewportWidth: number
): string {
  // Add padding around content
  const padding = viewportWidth < 768 ? 20 : 40;
  const viewBoxWidth = contentWidth + padding * 2;
  const viewBoxHeight = contentHeight + padding * 2;

  return `${-padding} ${-padding} ${viewBoxWidth} ${viewBoxHeight}`;
}

/**
 * Calculate maximum elements to display based on viewport
 * @param viewportWidth - Current viewport width
 * @param elementType - Type of element (array, tree, graph)
 * @returns Maximum number of elements to display
 */
export function getMaxElements(
  viewportWidth: number,
  elementType: "array" | "tree" | "graph"
): number {
  const isMobile = viewportWidth < 768;
  const isTablet = viewportWidth >= 768 && viewportWidth < 1024;

  switch (elementType) {
    case "array":
      if (isMobile) return 8;
      if (isTablet) return 12;
      return 20;

    case "tree":
      if (isMobile) return 15; // Max nodes in tree
      if (isTablet) return 31;
      return 63;

    case "graph":
      if (isMobile) return 8; // Max nodes in graph
      if (isTablet) return 12;
      return 20;

    default:
      return 10;
  }
}

/**
 * Get responsive class names for flex layout
 * @param viewportWidth - Current viewport width
 * @returns Tailwind class string for responsive layout
 */
export function getResponsiveFlexClasses(viewportWidth: number): string {
  return viewportWidth < 1024 ? "flex-col" : "flex-row";
}

/**
 * Check if horizontal scrolling should be enabled
 * @param contentWidth - Width of content
 * @param containerWidth - Width of container
 * @returns Boolean indicating if scrolling should be enabled
 */
export function shouldEnableHorizontalScroll(
  contentWidth: number,
  containerWidth: number
): boolean {
  return contentWidth > containerWidth;
}
