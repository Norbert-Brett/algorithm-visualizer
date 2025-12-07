"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Play, RotateCcw, Plus, Trash2, Package } from "lucide-react";

interface KnapsackVisualizationProps {
  speed: number;
}

interface Item {
  id: number;
  name: string;
  weight: number;
  value: number;
  isSelected?: boolean;
}

interface DPCell {
  row: number;
  col: number;
  value: number;
  isActive?: boolean;
  isComputed?: boolean;
}

export default function KnapsackVisualization({
  speed,
}: KnapsackVisualizationProps) {
  const [items, setItems] = useState<Item[]>([
    { id: 1, name: "A", weight: 2, value: 3 },
    { id: 2, name: "B", weight: 3, value: 4 },
    { id: 3, name: "C", weight: 4, value: 5 },
    { id: 4, name: "D", weight: 5, value: 6 },
  ]);
  const [capacity, setCapacity] = useState("10");
  const [newItemName, setNewItemName] = useState("");
  const [newItemWeight, setNewItemWeight] = useState("");
  const [newItemValue, setNewItemValue] = useState("");
  const [dpTable, setDpTable] = useState<DPCell[][]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStep, setCurrentStep] = useState("");
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [totalWeight, setTotalWeight] = useState(0);

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms / speed));

  const solveKnapsack = async (itemList: Item[], maxCapacity: number) => {
    setIsAnimating(true);
    setCurrentStep("Initializing DP table...");
    setSelectedItems([]);
    setTotalValue(0);
    setTotalWeight(0);

    const n = itemList.length;

    // Initialize DP table
    const table: DPCell[][] = [];
    const dp: number[][] = [];

    for (let i = 0; i <= n; i++) {
      table[i] = [];
      dp[i] = [];
      for (let w = 0; w <= maxCapacity; w++) {
        table[i][w] = {
          row: i,
          col: w,
          value: 0,
          isComputed: i === 0 || w === 0,
        };
        dp[i][w] = 0;
      }
    }

    setDpTable([...table]);
    await delay(800);

    // Fill DP table
    for (let i = 1; i <= n; i++) {
      const item = itemList[i - 1];
      setCurrentStep(`Processing item ${item.name} (w=${item.weight}, v=${item.value})`);
      await delay(500);

      for (let w = 1; w <= maxCapacity; w++) {
        // Highlight current cell
        table[i][w].isActive = true;
        setDpTable([...table]);

        if (item.weight <= w) {
          // Can include this item
          const includeValue = item.value + dp[i - 1][w - item.weight];
          const excludeValue = dp[i - 1][w];

          if (includeValue > excludeValue) {
            setCurrentStep(
              `Capacity ${w}: Including ${item.name} gives ${includeValue} > ${excludeValue}`
            );
            dp[i][w] = includeValue;
          } else {
            setCurrentStep(
              `Capacity ${w}: Excluding ${item.name} gives ${excludeValue} ≥ ${includeValue}`
            );
            dp[i][w] = excludeValue;
          }
        } else {
          // Cannot include this item
          setCurrentStep(
            `Capacity ${w}: ${item.name} too heavy (${item.weight} > ${w})`
          );
          dp[i][w] = dp[i - 1][w];
        }

        table[i][w].value = dp[i][w];
        table[i][w].isComputed = true;
        table[i][w].isActive = false;
        setDpTable([...table]);
        await delay(400);
      }
    }

    // Traceback to find selected items
    setCurrentStep("Tracing back to find selected items...");
    await delay(800);

    const selected: Item[] = [];
    let i = n;
    let w = maxCapacity;

    while (i > 0 && w > 0) {
      // Highlight traceback cell
      table[i][w].isActive = true;
      setDpTable([...table]);
      await delay(600);

      if (dp[i][w] !== dp[i - 1][w]) {
        // Item i was included
        const item = itemList[i - 1];
        selected.unshift(item);
        setSelectedItems([...selected]);
        setCurrentStep(`Selected item ${item.name}`);
        w -= item.weight;
      } else {
        setCurrentStep(`Skipped item ${itemList[i - 1].name}`);
      }

      table[i][w].isActive = false;
      i--;
      await delay(600);
    }

    const finalValue = dp[n][maxCapacity];
    const finalWeight = selected.reduce((sum, item) => sum + item.weight, 0);
    
    setTotalValue(finalValue);
    setTotalWeight(finalWeight);
    setCurrentStep(
      `Complete! Max value: ${finalValue}, Total weight: ${finalWeight}/${maxCapacity}`
    );
    setIsAnimating(false);
  };

  const solve = async () => {
    const cap = parseInt(capacity);
    if (isNaN(cap) || cap <= 0 || cap > 50) return;
    if (items.length === 0) return;

    await solveKnapsack(items, cap);
  };

  const addItem = () => {
    const weight = parseInt(newItemWeight);
    const value = parseInt(newItemValue);
    const name = newItemName.trim();

    if (name && !isNaN(weight) && !isNaN(value) && weight > 0 && value > 0) {
      const newItem: Item = {
        id: Date.now(),
        name,
        weight,
        value,
      };
      setItems([...items, newItem]);
      setNewItemName("");
      setNewItemWeight("");
      setNewItemValue("");
    }
  };

  const removeItem = (id: number) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const reset = () => {
    setDpTable([]);
    setSelectedItems([]);
    setTotalValue(0);
    setTotalWeight(0);
    setCurrentStep("");
    setIsAnimating(false);
  };

  const setExample = () => {
    setItems([
      { id: 1, name: "Gold", weight: 10, value: 60 },
      { id: 2, name: "Silver", weight: 20, value: 100 },
      { id: 3, name: "Bronze", weight: 30, value: 120 },
    ]);
    setCapacity("50");
    reset();
  };

  return (
    <div className="h-full flex flex-col p-2 sm:p-0">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-2 text-foreground">
          0/1 Knapsack Problem
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Maximize value while staying within weight capacity using dynamic
          programming.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 flex-1">
        {/* Controls */}
        <div className="w-full lg:w-80 space-y-4 order-2 lg:order-1 max-h-[70vh] overflow-y-auto">
          <div className="space-y-2">
            <label className="text-sm font-medium">Knapsack Capacity</label>
            <Input
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="Max weight..."
              min="1"
              max="50"
              disabled={isAnimating}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Items</label>
            <div className="space-y-2 p-2 bg-muted/30 rounded-lg max-h-[200px] overflow-y-auto">
              {items.length === 0 ? (
                <span className="text-xs text-muted-foreground">
                  No items added
                </span>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 bg-background rounded border"
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{item.name}</div>
                      <div className="text-xs text-muted-foreground">
                        W: {item.weight}, V: {item.value}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeItem(item.id)}
                      disabled={isAnimating}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Add Item</label>
            <div className="space-y-2">
              <Input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Name..."
                disabled={isAnimating}
                maxLength={10}
              />
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={newItemWeight}
                  onChange={(e) => setNewItemWeight(e.target.value)}
                  placeholder="Weight..."
                  disabled={isAnimating}
                  min="1"
                />
                <Input
                  type="number"
                  value={newItemValue}
                  onChange={(e) => setNewItemValue(e.target.value)}
                  placeholder="Value..."
                  disabled={isAnimating}
                  min="1"
                />
              </div>
              <Button
                onClick={addItem}
                disabled={
                  !newItemName.trim() ||
                  !newItemWeight ||
                  !newItemValue ||
                  isAnimating
                }
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={solve}
              disabled={items.length === 0 || !capacity || isAnimating}
              className="flex-1"
            >
              <Play className="h-4 w-4 mr-2" />
              Solve
            </Button>
            <Button
              onClick={reset}
              variant="outline"
              disabled={isAnimating}
              className="flex-1"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>

          <Button
            onClick={setExample}
            variant="outline"
            disabled={isAnimating}
            className="w-full"
          >
            Load Example
          </Button>

          {currentStep && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">{currentStep}</p>
            </div>
          )}

          {selectedItems.length > 0 && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="text-sm font-medium mb-2">Selected Items:</div>
              <div className="space-y-1">
                {selectedItems.map((item) => (
                  <Badge key={item.id} variant="default" className="mr-1">
                    {item.name}
                  </Badge>
                ))}
              </div>
              <div className="text-xs text-muted-foreground mt-2 space-y-1">
                <div>Total Value: {totalValue}</div>
                <div>
                  Total Weight: {totalWeight}/{capacity}
                </div>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="pt-4 border-t">
            <div className="text-sm font-medium mb-2">Legend:</div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>Computing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-600 rounded"></div>
                <span>Computed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Visualization */}
        <div className="flex-1 order-1 lg:order-2 overflow-auto">
          {dpTable.length > 0 ? (
            <div className="bg-muted/30 p-4 rounded-lg overflow-x-auto">
              <h3 className="text-sm font-semibold mb-3">
                DP Table (Items × Capacity)
              </h3>
              <div className="inline-block">
                {/* Header row with capacities */}
                <div className="flex mb-1">
                  <div className="w-16 h-10 flex items-center justify-center text-xs font-medium">
                    Item/Cap
                  </div>
                  {dpTable[0]?.map((_, colIdx) => (
                    <div
                      key={colIdx}
                      className="w-12 h-10 flex items-center justify-center text-xs font-mono text-muted-foreground"
                    >
                      {colIdx}
                    </div>
                  ))}
                </div>

                {/* Table rows */}
                {dpTable.map((row, rowIdx) => (
                  <div key={rowIdx} className="flex">
                    {/* Row header */}
                    <div className="w-16 h-10 flex items-center justify-center text-xs font-medium">
                      {rowIdx === 0 ? "∅" : items[rowIdx - 1]?.name || rowIdx}
                    </div>

                    {/* Table cells */}
                    {row.map((cell) => (
                      <motion.div
                        key={`${cell.row}-${cell.col}`}
                        className={`
                          w-12 h-10 border flex items-center justify-center text-xs font-mono
                          transition-colors duration-300
                          ${
                            cell.isActive
                              ? "border-blue-500 bg-blue-500/20"
                              : cell.isComputed
                              ? "border-green-600/30 bg-green-600/10"
                              : "border-muted-foreground/20 bg-background"
                          }
                        `}
                        animate={{
                          scale: cell.isActive ? 1.1 : 1,
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        {cell.value}
                      </motion.div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-40" />
                <p className="text-base font-medium mb-2">
                  Add items and set capacity
                </p>
                <p className="text-sm opacity-60">
                  Then click Solve to see the DP algorithm
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
