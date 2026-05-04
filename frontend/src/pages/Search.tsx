import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search as SearchIcon, SlidersHorizontal, X, ChevronLeft, ChevronRight } from "lucide-react";
import { fetchSchools } from "../api/schools";
import SchoolCard from "../components/SchoolCard";
import { US_STATES } from "../lib/format";
import type { SearchFilters } from "../types";
import clsx from "clsx";

const DEFAULT_FILTERS: SearchFilters = {
  q: "",
  state: "",
  school_type: "",
  locale: "",
  size_category: "",
  max_acceptance: "",
  max_tuition: "",
  min_grad_rate: "",
  sort_by: "name",
  sort_dir: "asc",
};

export default function SearchPage() {
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const params = {
    ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== "")),
    page,
    per_page: 18,
  };

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["schools", params],
    queryFn: () => fetchSchools(params),
    placeholderData: (prev) => prev,
  });

  const setFilter = useCallback((key: keyof SearchFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }, []);

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  };

  const activeFilterCount = Object.entries(filters).filter(
    ([k, v]) => v !== "" && k !== "sort_by" && k !== "sort_dir"
  ).length;

  const totalPages = data ? Math.ceil(data.total / 18) : 0;

  return (
    <div className="min-h-screen bg-cream">
      {/* Page header */}
      <div className="page-header py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-1">Explore Schools</h1>
          <p className="text-green-300 text-sm">
            {data ? `${data.total.toLocaleString()} schools match your filters` : "Searching..."}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Search bar + controls */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1">
            <SearchIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search school name or city..."
              value={filters.q}
              onChange={(e) => setFilter("q", e.target.value)}
              className="input pl-10"
            />
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={clsx(
              "btn-secondary gap-2 shrink-0",
              sidebarOpen && "border-green-900 text-green-900"
            )}
          >
            <SlidersHorizontal size={15} />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-orange text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
          <select
            value={`${filters.sort_by}:${filters.sort_dir}`}
            onChange={(e) => {
              const [by, dir] = e.target.value.split(":");
              setFilters((p) => ({ ...p, sort_by: by, sort_dir: dir }));
              setPage(1);
            }}
            className="select w-auto shrink-0 text-sm"
          >
            <option value="name:asc">Name A–Z</option>
            <option value="name:desc">Name Z–A</option>
            <option value="acceptance_rate:asc">Most Selective</option>
            <option value="acceptance_rate:desc">Least Selective</option>
            <option value="tuition_out_state:asc">Lowest Tuition</option>
            <option value="tuition_out_state:desc">Highest Tuition</option>
            <option value="graduation_rate:desc">Best Grad Rate</option>
            <option value="median_earnings_10yr:desc">Highest Earnings</option>
            <option value="undergrad_enrollment:desc">Largest Schools</option>
          </select>
        </div>

        <div className="flex gap-6">
          {/* Sidebar filters */}
          {sidebarOpen && (
            <aside className="w-64 shrink-0 space-y-5">
              <div className="card p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm text-gray-900">Filters</h3>
                  {activeFilterCount > 0 && (
                    <button onClick={clearFilters} className="text-xs text-orange hover:underline flex items-center gap-1">
                      <X size={11} /> Clear all
                    </button>
                  )}
                </div>

                <FilterSection label="State">
                  <select
                    value={filters.state}
                    onChange={(e) => setFilter("state", e.target.value)}
                    className="select text-sm"
                  >
                    <option value="">All states</option>
                    {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </FilterSection>

                <FilterSection label="School Type">
                  <select
                    value={filters.school_type}
                    onChange={(e) => setFilter("school_type", e.target.value)}
                    className="select text-sm"
                  >
                    <option value="">All types</option>
                    <option value="Public">Public</option>
                    <option value="Private nonprofit">Private Nonprofit</option>
                    <option value="Private for-profit">Private For-Profit</option>
                  </select>
                </FilterSection>

                <FilterSection label="Setting">
                  <select
                    value={filters.locale}
                    onChange={(e) => setFilter("locale", e.target.value)}
                    className="select text-sm"
                  >
                    <option value="">Any setting</option>
                    <option value="City">City</option>
                    <option value="Suburb">Suburb</option>
                    <option value="Town">Town</option>
                    <option value="Rural">Rural</option>
                  </select>
                </FilterSection>

                <FilterSection label="School Size">
                  <div className="flex flex-col gap-1.5">
                    {["", "Small", "Medium", "Large"].map((s) => (
                      <label key={s} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="size"
                          value={s}
                          checked={filters.size_category === s}
                          onChange={() => setFilter("size_category", s)}
                          className="accent-green-900"
                        />
                        <span className="text-sm text-gray-700">
                          {s === "" ? "Any size" : s === "Small" ? "Small (<2,000)" : s === "Medium" ? "Medium (2K–15K)" : "Large (15K+)"}
                        </span>
                      </label>
                    ))}
                  </div>
                </FilterSection>

                <FilterSection label="Max Acceptance Rate">
                  <select
                    value={filters.max_acceptance}
                    onChange={(e) => setFilter("max_acceptance", e.target.value)}
                    className="select text-sm"
                  >
                    <option value="">Any</option>
                    <option value="0.10">Under 10%</option>
                    <option value="0.25">Under 25%</option>
                    <option value="0.50">Under 50%</option>
                    <option value="0.75">Under 75%</option>
                  </select>
                </FilterSection>

                <FilterSection label="Max Out-of-State Tuition">
                  <select
                    value={filters.max_tuition}
                    onChange={(e) => setFilter("max_tuition", e.target.value)}
                    className="select text-sm"
                  >
                    <option value="">Any</option>
                    <option value="15000">Under $15,000</option>
                    <option value="25000">Under $25,000</option>
                    <option value="40000">Under $40,000</option>
                    <option value="55000">Under $55,000</option>
                  </select>
                </FilterSection>

                <FilterSection label="Min Graduation Rate">
                  <select
                    value={filters.min_grad_rate}
                    onChange={(e) => setFilter("min_grad_rate", e.target.value)}
                    className="select text-sm"
                  >
                    <option value="">Any</option>
                    <option value="0.5">50%+</option>
                    <option value="0.65">65%+</option>
                    <option value="0.8">80%+</option>
                    <option value="0.9">90%+</option>
                  </select>
                </FilterSection>
              </div>
            </aside>
          )}

          {/* Results */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="card h-64 animate-pulse bg-gray-100" />
                ))}
              </div>
            ) : data?.results.length === 0 ? (
              <div className="card p-12 text-center">
                <SearchIcon size={32} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No schools match your filters</p>
                <button onClick={clearFilters} className="mt-3 text-orange text-sm hover:underline">
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
                <div className={clsx(
                  "grid gap-4",
                  sidebarOpen ? "sm:grid-cols-2 xl:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                )}>
                  {data?.results.map((school) => (
                    <SchoolCard key={school.id} school={school} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                      className="btn-secondary py-2 px-3 disabled:opacity-40"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-sm text-gray-600 px-2">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      disabled={page === totalPages || isFetching}
                      onClick={() => setPage((p) => p + 1)}
                      className="btn-secondary py-2 px-3 disabled:opacity-40"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4 last:mb-0">
      <label className="stat-label block mb-1.5">{label}</label>
      {children}
    </div>
  );
}
