import { Link } from "react-router-dom";
import { MapPin, Users, TrendingUp, DollarSign, Plus, Check, GitCompare } from "lucide-react";
import { School } from "../types";
import { fmtPct, fmtDollar, fmtNum, acceptanceLabel, acceptanceColor } from "../lib/format";
import { useCompare } from "../context/CompareContext";
import clsx from "clsx";

interface Props {
  school: School;
}

export default function SchoolCard({ school }: Props) {
  const { addToCompare, removeFromCompare, isInCompare, compareIds } = useCompare();
  const inCompare = isInCompare(school.id);
  const canAdd = compareIds.length < 3 || inCompare;

  return (
    <div className="card-hover group flex flex-col overflow-hidden">
      {/* Header band */}
      <div className="bg-green-900 px-5 py-4 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <Link to={`/schools/${school.id}`} className="block">
            <h3 className="text-white font-bold text-base leading-snug group-hover:text-green-200 transition-colors line-clamp-2">
              {school.name}
            </h3>
          </Link>
          {(school.city || school.state) && (
            <div className="flex items-center gap-1 mt-1 text-green-300 text-xs">
              <MapPin size={11} />
              <span>{[school.city, school.state].filter(Boolean).join(", ")}</span>
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {school.school_type && (
            <span className="text-xs bg-white/15 text-white px-2 py-0.5 rounded-full whitespace-nowrap">
              {school.school_type}
            </span>
          )}
          {school.acceptance_rate != null && (
            <span className={clsx("badge text-xs", acceptanceColor(school.acceptance_rate))}>
              {acceptanceLabel(school.acceptance_rate)}
            </span>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div className="flex-1 px-5 py-4 grid grid-cols-2 gap-x-4 gap-y-3">
        <Stat
          icon={<TrendingUp size={13} className="text-green-700" />}
          label="Acceptance"
          value={fmtPct(school.acceptance_rate, 1)}
        />
        <Stat
          icon={<Users size={13} className="text-green-700" />}
          label="Enrollment"
          value={fmtNum(school.undergrad_enrollment)}
        />
        <Stat
          icon={<DollarSign size={13} className="text-orange" />}
          label="Out-of-state"
          value={fmtDollar(school.tuition_out_state)}
        />
        <Stat
          icon={<TrendingUp size={13} className="text-green-700" />}
          label="Grad Rate"
          value={fmtPct(school.graduation_rate, 1)}
        />
      </div>

      {/* Top programs */}
      {school.top_programs && (
        <div className="px-5 pb-3">
          <div className="text-xs text-gray-500 mb-1.5 font-medium">Top Programs</div>
          <div className="flex flex-wrap gap-1">
            {school.top_programs.split(", ").slice(0, 3).map((p) => (
              <span key={p} className="badge-gray text-xs">{p}</span>
            ))}
          </div>
        </div>
      )}

      {/* Footer actions */}
      <div className="border-t border-gray-100 px-5 py-3 flex items-center justify-between gap-2">
        <Link
          to={`/schools/${school.id}`}
          className="text-sm font-semibold text-green-900 hover:text-orange transition-colors"
        >
          View Details →
        </Link>
        <button
          onClick={() => inCompare ? removeFromCompare(school.id) : addToCompare(school.id)}
          disabled={!canAdd}
          className={clsx(
            "flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors",
            inCompare
              ? "bg-green-900 text-white border-green-900"
              : canAdd
              ? "border-gray-200 text-gray-600 hover:border-green-800 hover:text-green-900"
              : "border-gray-100 text-gray-300 cursor-not-allowed"
          )}
          title={!canAdd && !inCompare ? "Remove a school to add another" : undefined}
        >
          {inCompare ? (
            <><Check size={12} /> Added</>
          ) : (
            <><GitCompare size={12} /> Compare</>
          )}
        </button>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-1 mb-0.5">
        {icon}
        <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</span>
      </div>
      <span className="text-sm font-bold text-gray-900">{value}</span>
    </div>
  );
}
