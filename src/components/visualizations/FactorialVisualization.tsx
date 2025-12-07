"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Play, RotateCcw, Layers } from "lucide-react";

interface FactorialVisualizationProps {
  speed: number;
}

interface CallStackFrame {
  id: number;
  n: number;
  returnValue?: number;
  isActive: boolean;
  isReturning: boolean;
}

export default function FactorialVisualization({
  speed,
}: FactorialVisualizationProps) {
  const [inputValue, setInputValue] = useState("");
  const [callStack, setCallStack] = useState<CallStackFrame[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStep, setCurrentStep] = useState("");
  const [finalResult, setFinalResult] = useState<number | null>(null);

  const factorial = async (n: number, frameId = 0): Promise<number> => {
    // Add frame to call stack
    const newFrame: CallStackFrame = {
      id: frameId,
      n,
      isActive: true,
      isReturning: false,
    };

    setCallStack((prev) => [...prev, newFrame]);
    setCurrentStep(`Calling factorial(${n})`);
    await new Promise((resolve) => setTimeout(resolve, 1000 / speed));

    // Base case
    if (n === 0 || n === 1) {
      setCurrentStep(`Base case: factorial(${n}) = 1`);
      await new Promise((resolve) => setTimeout(resolve, 1000 / speed));

      // Mark frame as returning
      setCallStack((prev) =>
        prev.map((frame) =>
          frame.id === frameId
            ? { ...frame, returnValue: 1, isReturning: true, isActive: false }
            : frame
        )
      );
      await new Promise((resolve) => setTimeout(resolve, 800 / speed));

      return 1;
    }

    // Recursive case
    setCurrentStep(`Computing factorial(${n - 1}) for factorial(${n})`);
    await new Promise((resolve) => setTimeout(resolve, 800 / speed));

    const result = await factorial(n - 1, frameId + 1);

    // Calculate return value
    const returnValue = n * result;
    setCurrentStep(`factorial(${n}) = ${n} × ${result} = ${returnValue}`);
    await new Promise((resolve) => setTimeout(resolve, 1000 / speed));

    // Mark frame as returning
    setCallStack((prev) =>
      prev.map((frame) =>
        frame.id === frameId
          ? { ...frame, returnValue, isReturning: true, isActive: false }
          : frame
      )
    );
    await new Promise((resolve) => setTimeout(resolve, 800 / speed));

    // Remove frame from stack
    setCallStack((prev) => prev.filter((frame) => frame.id !== frameId));
    await new Promise((resolve) => setTimeout(resolve, 500 / speed));

    return returnValue;
  };

  const startFactorial = async () => {
    const n = parseInt(inputValue);
    if (isNaN(n) || n < 0 || n > 10) return;

    setIsAnimating(true);
    setCallStack([]);
    setFinalResult(null);
    setCurrentStep("");

    const result = await factorial(n, 0);

    setFinalResult(result);
    setCurrentStep(`Final result: ${n}! = ${result}`);
    setIsAnimating(false);
  };

  const reset = () => {
    setCallStack([]);
    setCurrentStep("");
    setFinalResult(null);
    setIsAnimating(false);
  };

  return (
    <div className="h-full flex flex-col p-2 sm:p-0">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-2 text-foreground">
          Factorial (Recursive) Visualization
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Watch the call stack grow and shrink as factorial is computed
          recursively. Base case: 0! = 1! = 1.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 flex-1">
        {/* Controls */}
        <div className="w-full lg:w-80 space-y-4 order-2 lg:order-1">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Enter Number (0-10)
            </label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && startFactorial()}
                placeholder="Enter n..."
                min="0"
                max="10"
                disabled={isAnimating}
              />
              <Button
                onClick={startFactorial}
                disabled={
                  !inputValue ||
                  isAnimating ||
                  parseInt(inputValue) < 0 ||
                  parseInt(inputValue) > 10
                }
              >
                <Play className="h-4 w-4 mr-2" />
                Start
              </Button>
            </div>
          </div>

          <Button
            onClick={reset}
            variant="outline"
            disabled={isAnimating}
            className="w-full"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>

          {currentStep && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">{currentStep}</p>
            </div>
          )}

          {finalResult !== null && (
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-sm font-medium text-green-600 dark:text-green-400">
                Result: {finalResult}
              </p>
            </div>
          )}

          <div className="pt-4 border-t">
            <div className="text-sm space-y-2">
              <div className="flex items-center justify-between">
                <span>Call Stack Depth:</span>
                <Badge variant="secondary">{callStack.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Status:</span>
                <Badge variant={isAnimating ? "default" : "outline"}>
                  {isAnimating ? "Computing..." : "Ready"}
                </Badge>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-muted-foreground font-medium">
                  Active Call
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-600 rounded"></div>
                <span className="text-muted-foreground font-medium">
                  Returning
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-muted rounded"></div>
                <span className="text-muted-foreground font-medium">
                  Waiting
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Visualization */}
        <div className="flex-1 flex items-center justify-center min-h-[300px] order-1 lg:order-2 overflow-x-auto">
          {callStack.length > 0 ? (
            <div className="flex flex-col-reverse gap-2 p-4">
              <AnimatePresence>
                {callStack.map((frame, index) => (
                  <motion.div
                    key={frame.id}
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                    className={`
                      relative p-4 rounded-lg border-2 min-w-[280px]
                      ${
                        frame.isReturning
                          ? "bg-green-500/10 border-green-500"
                          : frame.isActive
                          ? "bg-blue-500/10 border-blue-500"
                          : "bg-muted border-muted-foreground/20"
                      }
                    `}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4" />
                        <span className="font-mono font-bold">
                          factorial({frame.n})
                        </span>
                      </div>
                      <Badge
                        variant={
                          frame.isReturning
                            ? "default"
                            : frame.isActive
                            ? "secondary"
                            : "outline"
                        }
                        className={
                          frame.isReturning
                            ? "bg-green-600"
                            : frame.isActive
                            ? "bg-blue-500"
                            : ""
                        }
                      >
                        {frame.isReturning
                          ? "Returning"
                          : frame.isActive
                          ? "Active"
                          : "Waiting"}
                      </Badge>
                    </div>

                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Parameter:
                        </span>
                        <span className="font-mono font-semibold">
                          n = {frame.n}
                        </span>
                      </div>

                      {frame.n <= 1 && frame.isActive && (
                        <div className="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs">
                          <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                            Base case reached!
                          </span>
                        </div>
                      )}

                      {frame.returnValue !== undefined && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-2 pt-2 border-t flex justify-between"
                        >
                          <span className="text-muted-foreground">
                            Returns:
                          </span>
                          <span className="font-mono font-bold text-green-600 dark:text-green-400">
                            {frame.returnValue}
                          </span>
                        </motion.div>
                      )}
                    </div>

                    {index === callStack.length - 1 && frame.isActive && (
                      <motion.div
                        className="absolute -right-2 top-1/2 -translate-y-1/2"
                        animate={{ x: [0, 5, 0] }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <div className="w-0 h-0 border-t-8 border-t-transparent border-l-8 border-l-blue-500 border-b-8 border-b-transparent"></div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              <Layers className="h-12 w-12 mx-auto mb-4 opacity-40" />
              <p className="text-sm sm:text-base font-medium mb-2">
                Enter a number to visualize factorial
              </p>
              <p className="text-xs sm:text-sm opacity-60">
                Watch the call stack grow and shrink
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
