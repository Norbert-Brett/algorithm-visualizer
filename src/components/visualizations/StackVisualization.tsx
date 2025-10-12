"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus } from "lucide-react";

interface StackVisualizationProps {
  isPlaying: boolean;
  speed: number;
}

interface StackItem {
  id: number;
  value: string;
}

export default function StackVisualization({ speed }: StackVisualizationProps) {
  const [stack, setStack] = useState<StackItem[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [nextId, setNextId] = useState(0);

  const push = () => {
    if (inputValue.trim()) {
      const newItem: StackItem = {
        id: nextId,
        value: inputValue.trim()
      };
      setStack(prev => [...prev, newItem]);
      setInputValue("");
      setNextId(prev => prev + 1);
    }
  };

  const pop = () => {
    if (stack.length > 0) {
      setStack(prev => prev.slice(0, -1));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      push();
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 text-foreground">Stack Visualization</h2>
        <p className="text-muted-foreground">
          A stack is a Last-In-First-Out (LIFO) data structure. Elements are added and removed from the top.
        </p>
      </div>

      <div className="flex gap-6 flex-1">
        {/* Controls */}
        <div className="w-80 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Push Element</label>
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter value..."
                maxLength={10}
              />
              <Button onClick={push} disabled={!inputValue.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <Button 
            onClick={pop} 
            disabled={stack.length === 0}
            variant="outline"
            className="w-full"
          >
            <Minus className="h-4 w-4 mr-2" />
            Pop
          </Button>

          <div className="pt-4 border-t">
            <div className="text-sm space-y-2">
              <div className="flex items-center justify-between">
                <span>Size:</span>
                <Badge variant="secondary">{stack.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Top:</span>
                <Badge variant={stack.length > 0 ? "default" : "outline"}>
                  {stack.length > 0 ? stack[stack.length - 1].value : "empty"}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Visualization */}
        <div className="flex-1 flex items-end justify-center pb-20">
          <div className="relative">
            {/* Stack base */}
            <div className="w-32 h-4 bg-muted rounded-b-lg mb-2" />
            
            {/* Stack items */}
            <div className="flex flex-col-reverse gap-1">
              <AnimatePresence>
                {stack.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: -50, scale: 0.8 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0, 
                      scale: 1,
                      transition: { duration: 0.3 / speed }
                    }}
                    exit={{ 
                      opacity: 0, 
                      y: -50, 
                      scale: 0.8,
                      transition: { duration: 0.2 / speed }
                    }}
                    className={`
                      w-32 h-12 bg-primary text-primary-foreground 
                      rounded-lg flex items-center justify-center
                      font-mono font-medium text-lg
                      border-2 border-primary/20 shadow-md
                      ${index === stack.length - 1 ? 'ring-2 ring-ring ring-offset-2' : ''}
                    `}
                  >
                    {item.value}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Top indicator */}
            {stack.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute -right-16 top-0 flex items-center gap-2"
              >
                <div className="w-8 h-0.5 bg-ring" />
                <span className="text-sm font-medium text-muted-foreground">TOP</span>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}