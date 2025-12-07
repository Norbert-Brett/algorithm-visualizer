"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Play, RotateCcw, Coins } from "lucide-react";

interface MakingChangeVisualizationProps {
  speed: number;
}

interface DPCell {
  amount: number;
  minCoins: number | null;
  isActive?: boolean;
  isComputed?: boolean;
}

interface CoinUsed {
  amount: number;
  coin: number;
}

export default function MakingChangeVisualization({
  speed,
}: MakingChangeVisualizationProps) {
  const [targetAmount, setTargetAmount] = useState("");
  const [coins, setCoins] = useState<number[]>([1, 5, 10, 25]);
  const [coinInput, setCoinInput] = useState("");
  const [dpTable, setDpTable] = useState<DPCell[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStep, setCurrentStep] = useState("");
  const [finalCoins, setFinalCoins] = useState<number[]>([]);
  const [coinsUsed, setCoinsUsed] = useState<CoinUsed[]>([]);

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms / speed));

  const makingChange = async (amount: number, coinDenoms: number[]) => {
    setIsAnimating(true);
    setCurrentStep("Initializing DP table...");
    setFinalCoins([]);
    setCoinsUsed([]);

    // Initialize DP table
    const table: DPCell[] = [];
    const dp: number[] = new Array(amount + 1).fill(Infinity);
    const coinUsedTracker: CoinUsed[] = [];
    
    dp[0] = 0;
    
    for (let i = 0; i <= amount; i++) {
      table.push({
        amount: i,
        minCoins: i === 0 ? 0 : null,
        isComputed: i === 0,
      });
    }
    setDpTable([...table]);
    await delay(800);

    // Compute minimum coins for each amount
    for (let amt = 1; amt <= amount; amt++) {
      setCurrentStep(`Computing minimum coins for amount ${amt}...`);
      
      // Highlight current cell
      table[amt].isActive = true;
      setDpTable([...table]);
      await delay(600);

      let minCoins = Infinity;
      let bestCoin = -1;

      // Try each coin denomination
      for (const coin of coinDenoms) {
        if (coin <= amt) {
          setCurrentStep(
            `Trying coin ${coin} for amount ${amt}: ${amt} - ${coin} = ${amt - coin}`
          );
          await delay(500);

          const coinsNeeded = 1 + dp[amt - coin];
          if (coinsNeeded < minCoins) {
            minCoins = coinsNeeded;
            bestCoin = coin;
          }
        }
      }

      if (minCoins !== Infinity) {
        dp[amt] = minCoins;
        table[amt].minCoins = minCoins;
        table[amt].isComputed = true;
        
        if (bestCoin !== -1) {
          coinUsedTracker.push({ amount: amt, coin: bestCoin });
        }
        
        setCurrentStep(`Amount ${amt} requires minimum ${minCoins} coins`);
      } else {
        table[amt].minCoins = -1; // Impossible
        setCurrentStep(`Amount ${amt} cannot be made with given coins`);
      }

      table[amt].isActive = false;
      setDpTable([...table]);
      setCoinsUsed([...coinUsedTracker]);
      await delay(600);
    }

    // Reconstruct the coin combination
    if (dp[amount] !== Infinity) {
      setCurrentStep("Reconstructing coin combination...");
      await delay(800);

      const result: number[] = [];
      let remaining = amount;

      while (remaining > 0) {
        const coinUsedEntry = coinUsedTracker.find(
          (entry) => entry.amount === remaining
        );
        if (coinUsedEntry) {
          result.push(coinUsedEntry.coin);
          remaining -= coinUsedEntry.coin;
        } else {
          break;
        }
      }

      setFinalCoins(result.sort((a, b) => b - a));
      setCurrentStep(
        `Complete! ${amount} = ${result.sort((a, b) => b - a).join(" + ")}`
      );
    } else {
      setCurrentStep(`Cannot make amount ${amount} with given coins`);
    }

    setIsAnimating(false);
  };

  const compute = async () => {
    const amount = parseInt(targetAmount);
    if (isNaN(amount) || amount <= 0 || amount > 100) return;
    if (coins.length === 0) return;

    await makingChange(amount, coins);
  };

  const addCoin = () => {
    const coin = parseInt(coinInput);
    if (!isNaN(coin) && coin > 0 && coin <= 100 && !coins.includes(coin)) {
      setCoins([...coins, coin].sort((a, b) => a - b));
      setCoinInput("");
    }
  };

  const removeCoin = (coin: number) => {
    setCoins(coins.filter((c) => c !== coin));
  };

  const reset = () => {
    setDpTable([]);
    setFinalCoins([]);
    setCoinsUsed([]);
    setCurrentStep("");
    setIsAnimating(false);
  };

  const setPreset = (preset: "us" | "custom") => {
    if (preset === "us") {
      setCoins([1, 5, 10, 25]);
    } else {
      setCoins([1, 3, 4]);
    }
    reset();
  };

  return (
    <div className="h-full flex flex-col p-2 sm:p-0">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-2 text-foreground">
          Making Change (Coin Change Problem)
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Find the minimum number of coins needed to make a target amount using
          dynamic programming.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 flex-1">
        {/* Controls */}
        <div className="w-full lg:w-80 space-y-4 order-2 lg:order-1">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Target Amount (1-100)
            </label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="Enter amount..."
                min="1"
                max="100"
                disabled={isAnimating}
              />
              <Button
                onClick={compute}
                disabled={!targetAmount || isAnimating || coins.length === 0}
              >
                <Play className="h-4 w-4 mr-2" />
                Solve
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Coin Denominations</label>
            <div className="flex flex-wrap gap-2 p-2 bg-muted/30 rounded-lg min-h-[60px]">
              {coins.length === 0 ? (
                <span className="text-xs text-muted-foreground">
                  No coins added
                </span>
              ) : (
                coins.map((coin) => (
                  <Badge
                    key={coin}
                    variant="secondary"
                    className="cursor-pointer hover:bg-destructive/20"
                    onClick={() => !isAnimating && removeCoin(coin)}
                  >
                    <Coins className="h-3 w-3 mr-1" />
                    {coin}
                    {!isAnimating && (
                      <span className="ml-1 text-xs">×</span>
                    )}
                  </Badge>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                value={coinInput}
                onChange={(e) => setCoinInput(e.target.value)}
                placeholder="Add coin..."
                min="1"
                max="100"
                disabled={isAnimating}
                onKeyDown={(e) => e.key === "Enter" && addCoin()}
              />
              <Button onClick={addCoin} disabled={!coinInput || isAnimating}>
                Add
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setPreset("us")}
              variant="outline"
              disabled={isAnimating}
              className="flex-1"
            >
              US Coins
            </Button>
            <Button
              onClick={() => setPreset("custom")}
              variant="outline"
              disabled={isAnimating}
              className="flex-1"
            >
              Custom
            </Button>
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

          {finalCoins.length > 0 && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="text-sm font-medium mb-2">Solution:</div>
              <div className="flex flex-wrap gap-2">
                {finalCoins.map((coin, idx) => (
                  <Badge key={idx} variant="default">
                    <Coins className="h-3 w-3 mr-1" />
                    {coin}
                  </Badge>
                ))}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Total: {finalCoins.length} coins
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
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-muted-foreground/20 rounded"></div>
                <span>Not computed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Visualization */}
        <div className="flex-1 order-1 lg:order-2 overflow-auto">
          {dpTable.length > 0 ? (
            <div className="bg-muted/30 p-4 rounded-lg">
              <h3 className="text-sm font-semibold mb-3">
                DP Table (Amount → Min Coins)
              </h3>
              <div className="flex flex-wrap gap-2">
                {dpTable.map((cell) => (
                  <motion.div
                    key={cell.amount}
                    className={`
                      w-16 h-20 rounded-lg border-2 flex flex-col items-center justify-center
                      transition-colors duration-300
                      ${
                        cell.isActive
                          ? "border-blue-500 bg-blue-500/20"
                          : cell.isComputed
                          ? "border-green-600 bg-green-600/20"
                          : "border-muted-foreground/20 bg-background"
                      }
                    `}
                    animate={{
                      scale: cell.isActive ? 1.1 : 1,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="text-xs text-muted-foreground mb-1">
                      amt: {cell.amount}
                    </div>
                    <div className="text-lg font-bold">
                      {cell.minCoins === null
                        ? "?"
                        : cell.minCoins === -1
                        ? "∞"
                        : cell.minCoins}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      coins
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <Coins className="h-12 w-12 mx-auto mb-4 opacity-40" />
                <p className="text-base font-medium mb-2">
                  Set target amount and coins
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
