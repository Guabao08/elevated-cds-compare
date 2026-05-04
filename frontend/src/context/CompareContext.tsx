import { createContext, useContext, useState, ReactNode } from "react";

interface CompareContextType {
  compareIds: number[];
  addToCompare: (id: number) => void;
  removeFromCompare: (id: number) => void;
  clearCompare: () => void;
  isInCompare: (id: number) => boolean;
}

const CompareContext = createContext<CompareContextType | null>(null);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [compareIds, setCompareIds] = useState<number[]>([]);

  const addToCompare = (id: number) => {
    setCompareIds((prev) => (prev.includes(id) || prev.length >= 3 ? prev : [...prev, id]));
  };

  const removeFromCompare = (id: number) => {
    setCompareIds((prev) => prev.filter((i) => i !== id));
  };

  const clearCompare = () => setCompareIds([]);

  const isInCompare = (id: number) => compareIds.includes(id);

  return (
    <CompareContext.Provider value={{ compareIds, addToCompare, removeFromCompare, clearCompare, isInCompare }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within CompareProvider");
  return ctx;
}
