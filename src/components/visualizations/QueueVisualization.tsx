"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus } from "lucide-react";

interface QueueVisualizationProps {
  isPlaying: boolean;
  speed: number;
}

interface QueueItem {
  id: number;
  value: string;
}

export default function QueueVisualization({ speed }: QueueVisualizationProps) {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [nextId, setNextId] = useState(0);

  const enqueue = () => {
    if (inputValue.trim()) {
      const newItem: QueueItem = {
        id: nextId,
        value: inputValue.trim()
      };
      setQueue(prev => [...prev, newItem]);
      setInputValue("");
      setNextId(prev => prev + 1);
    }
  };

  const dequeue = () => {
    if (queue.length > 0) {
      setQueue(prev => prev.slice(1));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      enqueue();
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 text-foreground">Queue Visualization</h2>
        <p className="text-muted-foreground">
          A queue is a First-In-First-Out (FIFO) data structure. Elements are added at the rear and removed from the front.
        </p>
      </div>

      <div className="flex gap-6 flex-1">
        {/* Controls */}
        <div className="w-80 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Enqueue Element</label>
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter value..."
                maxLength={10}
              />
              <Button onClick={enqueue} disabled={!inputValue.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <Button 
            onClick={dequeue} 
            disabled={queue.length === 0}
            variant="outline"
            className="w-full"
          >
            <Minus className="h-4 w-4 mr-2" />
            Dequeue
          </Button>

          <div className="pt-4 border-t">
            <div className="text-sm space-y-2">
              <div className="flex items-center justify-between">
                <span>Size:</span>
                <Badge variant="secondary">{queue.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Front:</span>
                <Badge variant={queue.length > 0 ? "default" : "outline"}>
                  {queue.length > 0 ? queue[0].value : "empty"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Rear:</span>
                <Badge variant={queue.length > 0 ? "default" : "outline"}>
                  {queue.length > 0 ? queue[queue.length - 1].value : "empty"}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Visualization */}
        <div className="flex-1 flex items-center justify-center">
          <div className="relative">
            {/* Queue container */}
            <div className="flex items-center gap-2 min-w-[200px] p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-muted/50">
              <AnimatePresence mode="popLayout">
                {queue.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 100, scale: 0.8 }}
                    animate={{ 
                      opacity: 1, 
                      x: 0, 
                      scale: 1,
                      transition: { duration: 0.3 / speed }
                    }}
                    exit={{ 
                      opacity: 0, 
                      x: -100, 
                      scale: 0.8,
                      transition: { duration: 0.2 / speed }
                    }}
                    layout
                    className={`
                      w-16 h-16 bg-primary text-primary-foreground 
                      rounded-lg flex items-center justify-center
                      font-mono font-medium text-sm
                      border-2 border-primary/20 shadow-md
                      ${index === 0 ? 'ring-2 ring-ring ring-offset-2' : ''}
                      ${index === queue.length - 1 && queue.length > 1 ? 'ring-2 ring-accent ring-offset-2' : ''}
                    `}
                  >
                    {item.value}
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {queue.length === 0 && (
                <div className="text-muted-foreground text-sm font-medium">Empty Queue</div>
              )}
            </div>

            {/* Labels */}
            {queue.length > 0 && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute -top-8 left-4 text-sm font-medium text-muted-foreground"
                >
                  FRONT
                </motion.div>
                {queue.length > 1 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute -top-8 right-4 text-sm font-medium text-muted-foreground"
                  >
                    REAR
                  </motion.div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}