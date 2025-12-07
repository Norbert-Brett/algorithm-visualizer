import { useEffect, useState, RefObject } from "react";

export interface OverflowState {
  horizontal: boolean;
  vertical: boolean;
}

/**
 * Hook to detect if an element has overflow
 * @param ref - React ref to the element to monitor
 * @returns Object indicating horizontal and vertical overflow state
 */
export function useOverflowDetection<T extends HTMLElement>(
  ref: RefObject<T>
): OverflowState {
  const [overflow, setOverflow] = useState<OverflowState>({
    horizontal: false,
    vertical: false,
  });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const checkOverflow = () => {
      const hasHorizontalOverflow = element.scrollWidth > element.clientWidth;
      const hasVerticalOverflow = element.scrollHeight > element.clientHeight;

      setOverflow({
        horizontal: hasHorizontalOverflow,
        vertical: hasVerticalOverflow,
      });
    };

    // Check initially
    checkOverflow();

    // Create ResizeObserver to monitor size changes
    const resizeObserver = new ResizeObserver(checkOverflow);
    resizeObserver.observe(element);

    // Also listen to window resize
    window.addEventListener("resize", checkOverflow);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", checkOverflow);
    };
  }, [ref]);

  return overflow;
}
