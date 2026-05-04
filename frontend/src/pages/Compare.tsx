import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchCompare } from "../api/schools";
import { useCompare } from "../context/CompareContext";
import { fmtPct, fmtDollar, fmtNum, fmtSAT } from "../lib/format";
import { X, GitCompare, ExternalLink, Search } from "lucide-react";
import type { School } from "../types";
import clsx from "clsx";

type MetricRow = {
  label: string;
  getValue: (s: School) => string | number | null;
  format: (v: string | number | null) => string;
  higherIsBetter?: boolean;
  lowerIsBetter?: boolean;
};

const METRICS: { section: string; rows: MetricRow[] }[] = [
  {
    section: "Admissions",
    rows: [
      { label: "Acceptance Rate", getValue: (s) => s.acceptance_rate, format: (v) => fmtPct(v as number | null, 1), lowerIsBetter: true },
      { label: "SAT Average", getValue: (s) => s.sat_avg, format: (v) => fmtSAT(v as number | null), higherIsBetter: true },
      { label: "ACT Midpoint", getValue: (s) => s.act_midpoint, format: (v) => v != null ? String(Math.round(v as number)) : "—", higherIsBetter: true },
    ],
  },
  {
    section: "Cost",
    rows: [
      { label: "In-State Tuition", getValue: (s) => s.tuition_in_state, format: (v) => fmtDollar(v as number | null), lowerIsBetter: true },
      { label: "Out-of-State Tuition", getValue: (s) => s.tuition_out_state, format: (v) => fmtDollar(v as number | null), lowerIsBetter: true },
      { label: "Avg Net Price", getValue: (s) => s.avg_net_price, format: (v) => fmtDollar(v as number | null), lowerIsBetter: true },
      { label: "Median Debt", getValue: (s) => s.median_debt, format: (v) => fmtDollar(v as number | null), lowerIsBetter: true },
    ],
  },
  {
    section: "Outcomes",
    rows: [
      { label: "Graduation Rate", getValue: (s) => s.graduation_rate, format: (v) => fmtPct(v as number | null, 1), higherIsBetter: true },
      { label: "Retention Rate", getValue: (s) => s.retention_rate, format: (v) => fmtPct(v as number | null, 1), higherIsBetter: true },
      { label: "Median Earnings (10yr)", getValue: (s) => s.median_earnings_10yr, format: (v) => fmtDollar(v as number | null), higherIsBetter: true },
    ],
  },
  {
    section: "School Info",
    rows: [
      { label: "Enrollment", getValue: (s) => s.undergrad_enrollment, format: (v) => fmtNum(v as number | null) },
      { label: "Type", getValue: (s) => s.school_type, format: (v) => String(v ?? "—") },
      { label: "Setting", getValue: (s) => s.locale, format: (v) => String(v ?? "—") },
      { label: "Size", getValue: (s) => s.size_category, format: (v) => String(v ?? "—") },
    ],
  },
];

function getBestIndex(values: (number | null)[], higherIsBetter?: boolean, lowerIsBetter?: boolean): number | null {
  const nums = values.map((v, i) => ({ v, i })).filter((x) => x.v != null);
  if (nums.length < 2) return null;
  if (higherIsBetter) return nums.reduce((a, b) => (b.v! > a.v! ? b : a)).i;
  if (lowerIsBetter) return nums.reduce((a, b) => (b.v! < a.v! ? b : a)).i;
  return null;
}

export default function ComparePage() {
  const { compareIds, removeFromCompare, clearCompare } = useCompare();

  const { data: schools, isLoading } = useQuery({
    queryKey: ["compare", compareIds],
    queryFn: () => fetchCompare(compareIds),
    enabled: compareIds.length > 0,
  });

  if (compareIds.length === 0) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="card p-12 max-w-md w-full text-center">
          <GitCompare size={40} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-green-900 mb-2">No Schools Selected</h2>
          <p className="text-gray-500 text-sm mb-6">
            Go to school search and add up to 3 schools to compare side-by-side.
          </p>
          <Link to="/search" className="btn-primary">
            <Search size={15} /> Browse Schools
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pb-16">
      <div className="page-header py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-1">Compare Schools</h1>
            <p className="text-green-300 text-sm">Side-by-side comparison of {compareIds.length} school{compareIds.length > 1 ? "s" : ""}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/search" className="btn-secondary text-white border-white/20 hover:bg-white/10 hover:text-white text-sm">
              + Add School
            </Link>
            <button onClick={clearCompare} className="text-green-300 hover:text-white text-sm transition-colors">
              Clear All
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {isLoading ? (
          <div className="card p-12 text-center animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mx-auto" />
          </div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left p-5 w-40 text-sm font-semibold text-gray-500 bg-gray-50/50">Metric</th>
                  {(schools ?? []).map((school) => (
                    <th key={school.id} className="p-5 text-left min-w-[180px]">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link
                            to={`/schools/${school.id}`}
                            className="font-bold text-green-900 hover:text-orange transition-colors text-sm leading-snug block"
                          >
                            {school.name}
                          </Link>
                          <span className="text-xs text-gray-400">{[school.city, school.state].filter(Boolean).join(", ")}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {school.url && (
                            <a
                              href={`https://${school.url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-400 hover:text-green-800 transition-colors"
                            >
                              <ExternalLink size={13} />
                            </a>
                          )}
                          <button
                            onClick={() => removeFromCompare(school.id)}
                            className="text-gray-300 hover:text-red-400 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {school.school_type && (
                          <span className="badge-green text-xs">{school.school_type}</span>
                        )}
                        {school.size_category && (
                          <span className="badge-gray text-xs">{school.size_category}</span>
                        )}
                      </div>
                    </th>
                  ))}
                  {/* Placeholder columns */}
                  {Array.from({ length: 3 - (schools?.length ?? 0) }).map((_, i) => (
                    <th key={`empty-${i}`} className="p-5 min-w-[180px]">
                      <Link to="/search" className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-6 hover:border-green-800 hover:text-green-800 text-gray-400 transition-colors text-sm gap-1">
                        <span className="text-2xl font-light">+</span>
                        <span>Add school</span>
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {METRICS.map(({ section, rows }) => (
                  <>
                    <tr key={section} className="bg-cream border-b border-gray-100">
                      <td colSpan={4} className="px-5 py-2.5">
                        <span className="text-xs font-bold text-green-900 uppercase tracking-wider">{section}</span>
                      </td>
                    </tr>
                    {rows.map((row) => {
                      const rawValues = (schools ?? []).map((s) => {
                        const v = row.getValue(s);
                        return typeof v === "number" ? v : null;
                      });
                      const bestIdx = getBestIndex(rawValues, row.higherIsBetter, row.lowerIsBetter);
                      return (
                        <tr key={row.label} className="border-b border-gray-50 hover:bg-gray-50/50">
                          <td className="px-5 py-3.5 text-sm text-gray-600 font-medium bg-gray-50/30 whitespace-nowrap">
                            {row.label}
                          </td>
                          {(schools ?? []).map((school, idx) => {
                            const raw = row.getValue(school);
                            const formatted = row.format(raw);
                            const isBest = bestIdx === idx;
                            return (
                              <td key={school.id} className={clsx("px-5 py-3.5 text-sm font-semibold", isBest && "text-green-800")}>
                                <div className="flex items-center gap-1.5">
                                  {formatted}
                                  {isBest && (
                                    <span className="bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded font-bold">
                                      Best
                                    </span>
                                  )}
                                </div>
                              </td>
                            );
                          })}
                          {Array.from({ length: 3 - (schools?.length ?? 0) }).map((_, i) => (
                            <td key={`empty-${i}`} className="px-5 py-3.5 text-gray-200">—</td>
                          ))}
                        </tr>
                      );
                    })}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Programs comparison */}
        {schools && schools.some((s) => s.top_programs) && (
          <div className="card p-6 mt-6">
            <h3 className="font-bold text-green-900 mb-4 pb-3 border-b border-gray-100">Top Programs</h3>
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${schools.length}, 1fr)` }}>
              {schools.map((school) => (
                <div key={school.id}>
                  <div className="text-sm font-semibold text-gray-700 mb-2">{school.name.split(" ").slice(0, 3).join(" ")}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {(school.top_programs || "").split(", ").map((p) => (
                      <span key={p} className="badge-green text-xs">{p}</span>
                    ))}
                    {!school.top_programs && <span className="text-gray-400 text-xs">No data</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
