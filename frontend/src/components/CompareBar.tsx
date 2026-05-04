import { Link } from "react-router-dom";
import { X, GitCompare } from "lucide-react";
import { useCompare } from "../context/CompareContext";
import { useQuery } from "@tanstack/react-query";
import { fetchCompare } from "../api/schools";

export default function CompareBar() {
  const { compareIds, removeFromCompare, clearCompare } = useCompare();

  const { data: schools } = useQuery({
    queryKey: ["compare-preview", compareIds],
    queryFn: () => fetchCompare(compareIds),
    enabled: compareIds.length > 0,
  });

  if (compareIds.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-green-900 text-white shadow-2xl border-t-2 border-orange">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <GitCompare size={16} className="text-orange" />
          <span className="font-semibold text-sm">Comparing {compareIds.length}/3</span>
        </div>

        <div className="flex-1 flex items-center gap-3 overflow-x-auto">
          {(schools || []).map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5 shrink-0"
            >
              <span className="text-sm font-medium whitespace-nowrap max-w-[180px] truncate">{s.name}</span>
              <button
                onClick={() => removeFromCompare(s.id)}
                className="text-green-300 hover:text-white transition-colors"
              >
                <X size={13} />
              </button>
            </div>
          ))}
          {Array.from({ length: 3 - compareIds.length }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="flex items-center justify-center border border-dashed border-white/20 rounded-lg px-4 py-1.5 text-xs text-green-400 whitespace-nowrap shrink-0"
            >
              + Add school
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={clearCompare}
            className="text-xs text-green-300 hover:text-white transition-colors"
          >
            Clear
          </button>
          <Link
            to="/compare"
            className="btn-primary text-sm py-2"
          >
            Compare Now
          </Link>
        </div>
      </div>
    </div>
  );
}
