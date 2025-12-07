"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, RotateCcw } from "lucide-react";

interface IndexingVisualizationProps {
  isPlaying?: boolean;
  speed: number;
}

interface DataRecord {
  id: number;
  name: string;
  age: number;
  isHighlighted?: boolean;
}

interface IndexEntry {
  key: number | string;
  pointer: number;
  isHighlighted?: boolean;
}

type IndexType = "primary" | "secondary" | "clustered";

export default function IndexingVisualization({
  speed,
}: IndexingVisualizationProps) {
  const [records, setRecords] = useState<DataRecord[]>([]);
  const [primaryIndex, setPrimaryIndex] = useState<IndexEntry[]>([]);
  const [secondaryIndex, setSecondaryIndex] = useState<IndexEntry[]>([]);
  const [indexType, setIndexType] = useState<IndexType>("primary");
  const [searchKey, setSearchKey] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [ageInput, setAgeInput] = useState("");

  const rebuildIndexes = useCallback((data: DataRecord[]) => {
    // Primary index (sorted by ID)
    const primary = data
      .map((record, idx) => ({
        key: record.id,
        pointer: idx,
      }))
      .sort((a, b) => (a.key as number) - (b.key as number));
    setPrimaryIndex(primary);

    // Secondary index (sorted by name)
    const secondary = data
      .map((record, idx) => ({
        key: record.name,
        pointer: idx,
      }))
      .sort((a, b) => (a.key as string).localeCompare(b.key as string));
    setSecondaryIndex(secondary);
  }, []);

  const initializeSampleData = useCallback(() => {
    const sampleRecords: DataRecord[] = [
      { id: 1, name: "Alice", age: 25 },
      { id: 2, name: "Bob", age: 30 },
      { id: 3, name: "Charlie", age: 22 },
      { id: 4, name: "Diana", age: 28 },
      { id: 5, name: "Eve", age: 35 },
    ];
    setRecords(sampleRecords);
    rebuildIndexes(sampleRecords);
  }, [rebuildIndexes]);

  // Initialize with sample data
  useEffect(() => {
    initializeSampleData();
  }, [initializeSampleData]);

  const addRecord = () => {
    const name = nameInput.trim();
    const age = parseInt(ageInput);

    if (name && !isNaN(age) && age > 0 && age < 120) {
      const newRecord: DataRecord = {
        id: records.length + 1,
        name: name,
        age: age,
      };
      const updatedRecords = [...records, newRecord];
      setRecords(updatedRecords);
      rebuildIndexes(updatedRecords);
      setNameInput("");
      setAgeInput("");
    }
  };

  const searchByPrimaryIndex = async (key: number) => {
    setIsAnimating(true);

    // Binary search through primary index
    let left = 0;
    let right = primaryIndex.length - 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);

      // Highlight current index entry
      const highlightedIndex = primaryIndex.map((entry, idx) => ({
        ...entry,
        isHighlighted: idx === mid,
      }));
      setPrimaryIndex(highlightedIndex);
      await new Promise((resolve) => setTimeout(resolve, 1000 / speed));

      if ((primaryIndex[mid].key as number) === key) {
        // Found! Highlight the record
        const pointer = primaryIndex[mid].pointer;
        const highlightedRecords = records.map((record, idx) => ({
          ...record,
          isHighlighted: idx === pointer,
        }));
        setRecords(highlightedRecords);
        await new Promise((resolve) => setTimeout(resolve, 1500 / speed));
        break;
      } else if ((primaryIndex[mid].key as number) < key) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    setIsAnimating(false);
  };

  const searchBySecondaryIndex = async (key: string) => {
    setIsAnimating(true);

    // Linear search through secondary index
    for (let i = 0; i < secondaryIndex.length; i++) {
      // Highlight current index entry
      const highlightedIndex = secondaryIndex.map((entry, idx) => ({
        ...entry,
        isHighlighted: idx === i,
      }));
      setSecondaryIndex(highlightedIndex);
      await new Promise((resolve) => setTimeout(resolve, 800 / speed));

      if (secondaryIndex[i].key === key) {
        // Found! Highlight the record
        const pointer = secondaryIndex[i].pointer;
        const highlightedRecords = records.map((record, idx) => ({
          ...record,
          isHighlighted: idx === pointer,
        }));
        setRecords(highlightedRecords);
        await new Promise((resolve) => setTimeout(resolve, 1500 / speed));
        break;
      }
    }

    setIsAnimating(false);
  };

  const searchByClusteredIndex = async (key: number) => {
    setIsAnimating(true);

    // In clustered index, data is physically sorted by key
    // Simulate binary search directly on records
    let left = 0;
    let right = records.length - 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);

      // Highlight current record
      const highlightedRecords = records.map((record, idx) => ({
        ...record,
        isHighlighted: idx === mid,
      }));
      setRecords(highlightedRecords);
      await new Promise((resolve) => setTimeout(resolve, 1000 / speed));

      if (records[mid].id === key) {
        // Found!
        await new Promise((resolve) => setTimeout(resolve, 1000 / speed));
        break;
      } else if (records[mid].id < key) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    setIsAnimating(false);
  };

  const performSearch = async () => {
    if (!searchKey || isAnimating) return;

    // Clear previous highlights
    reset();
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (indexType === "primary") {
      const key = parseInt(searchKey);
      if (!isNaN(key)) {
        await searchByPrimaryIndex(key);
      }
    } else if (indexType === "secondary") {
      await searchBySecondaryIndex(searchKey);
    } else if (indexType === "clustered") {
      const key = parseInt(searchKey);
      if (!isNaN(key)) {
        await searchByClusteredIndex(key);
      }
    }
  };

  const reset = () => {
    setRecords((prev) =>
      prev.map((record) => ({ ...record, isHighlighted: false }))
    );
    setPrimaryIndex((prev) =>
      prev.map((entry) => ({ ...entry, isHighlighted: false }))
    );
    setSecondaryIndex((prev) =>
      prev.map((entry) => ({ ...entry, isHighlighted: false }))
    );
    setIsAnimating(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      performSearch();
    }
  };

  return (
    <div className="h-full flex flex-col p-2 sm:p-0">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-2 text-foreground">
          Indexing Techniques Visualization
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Compare different indexing methods: Primary Index (sorted by ID),
          Secondary Index (sorted by name), and Clustered Index (data physically sorted).
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 flex-1">
        {/* Controls */}
        <div className="w-full lg:w-80 space-y-4 order-2 lg:order-1">
          <div className="space-y-2">
            <label className="text-sm font-medium">Index Type</label>
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => setIndexType("primary")}
                variant={indexType === "primary" ? "default" : "outline"}
                disabled={isAnimating}
                className="w-full justify-start"
              >
                Primary Index (ID)
              </Button>
              <Button
                onClick={() => setIndexType("secondary")}
                variant={indexType === "secondary" ? "default" : "outline"}
                disabled={isAnimating}
                className="w-full justify-start"
              >
                Secondary Index (Name)
              </Button>
              <Button
                onClick={() => setIndexType("clustered")}
                variant={indexType === "clustered" ? "default" : "outline"}
                disabled={isAnimating}
                className="w-full justify-start"
              >
                Clustered Index
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Search Key {indexType === "secondary" ? "(Name)" : "(ID)"}
            </label>
            <div className="flex gap-2">
              <Input
                type={indexType === "secondary" ? "text" : "number"}
                value={searchKey}
                onChange={(e) => setSearchKey(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  indexType === "secondary" ? "Enter name..." : "Enter ID..."
                }
              />
              <Button
                onClick={performSearch}
                disabled={!searchKey || isAnimating}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t space-y-2">
            <label className="text-sm font-medium">Add Record</label>
            <Input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Name"
              disabled={isAnimating}
            />
            <Input
              type="number"
              value={ageInput}
              onChange={(e) => setAgeInput(e.target.value)}
              placeholder="Age"
              disabled={isAnimating}
            />
            <Button
              onClick={addRecord}
              disabled={!nameInput || !ageInput || isAnimating}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Record
            </Button>
          </div>

          <Button
            onClick={reset}
            variant="outline"
            disabled={isAnimating}
            className="w-full"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Clear Highlights
          </Button>

          <div className="pt-4 border-t">
            <div className="text-sm space-y-2">
              <div className="flex items-center justify-between">
                <span>Records:</span>
                <Badge variant="secondary">{records.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Status:</span>
                <Badge variant={isAnimating ? "default" : "outline"}>
                  {isAnimating ? "Searching..." : "Ready"}
                </Badge>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-xs">
              <p className="text-muted-foreground font-medium">Index Types:</p>
              <p className="text-muted-foreground">
                <strong>Primary:</strong> Fast lookup by ID (binary search)
              </p>
              <p className="text-muted-foreground">
                <strong>Secondary:</strong> Lookup by name (linear search)
              </p>
              <p className="text-muted-foreground">
                <strong>Clustered:</strong> Data sorted by ID (no separate index)
              </p>
            </div>
          </div>
        </div>

        {/* Visualization */}
        <div className="flex-1 order-1 lg:order-2 overflow-x-auto">
          <div className="space-y-6 min-w-max">
            {/* Index Structure */}
            {indexType !== "clustered" && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">
                  {indexType === "primary" ? "Primary Index" : "Secondary Index"}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(indexType === "primary" ? primaryIndex : secondaryIndex).map(
                    (entry, idx) => (
                      <motion.div
                        key={idx}
                        className={`
                          px-3 py-2 rounded-lg border-2 transition-all duration-300
                          ${
                            entry.isHighlighted
                              ? "bg-blue-500 border-blue-600 text-white scale-110"
                              : "bg-card border-border"
                          }
                        `}
                        animate={{
                          scale: entry.isHighlighted ? 1.1 : 1,
                        }}
                      >
                        <div className="text-xs font-mono">
                          <div className="font-semibold">Key: {entry.key}</div>
                          <div className="text-muted-foreground">
                            → Ptr: {entry.pointer}
                          </div>
                        </div>
                      </motion.div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Data Records */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">
                Data Records
                {indexType === "clustered" && " (Physically Sorted by ID)"}
              </h3>
              <div className="space-y-2">
                {records.map((record, idx) => (
                  <motion.div
                    key={record.id}
                    className={`
                      p-3 rounded-lg border-2 transition-all duration-300
                      ${
                        record.isHighlighted
                          ? "bg-green-500 border-green-600 text-white scale-105"
                          : "bg-card border-border"
                      }
                    `}
                    animate={{
                      scale: record.isHighlighted ? 1.05 : 1,
                    }}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-xs text-muted-foreground font-mono">
                        [{idx}]
                      </div>
                      <div className="flex-1 font-mono text-sm">
                        <span className="font-semibold">ID: {record.id}</span>
                        <span className="mx-2">|</span>
                        <span>Name: {record.name}</span>
                        <span className="mx-2">|</span>
                        <span>Age: {record.age}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
