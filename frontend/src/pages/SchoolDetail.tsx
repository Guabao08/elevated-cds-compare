import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchSchool } from "../api/schools";
import { fmtPct, fmtDollar, fmtNum, fmtSAT, acceptanceLabel } from "../lib/format";
import { useCompare } from "../context/CompareContext";
import {
  MapPin, Globe, GitCompare, Check, ArrowLeft,
  GraduationCap, DollarSign, Users, TrendingUp,
  BookOpen, BarChart2, Heart
} from "lucide-react";
import clsx from "clsx";

export default function SchoolDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: school, isLoading, error } = useQuery({
    queryKey: ["school", id],
    queryFn: () => fetchSchool(Number(id)),
    enabled: !!id,
  });

  const { addToCompare, removeFromCompare, isInCompare, compareIds } = useCompare();
  const inCompare = school ? isInCompare(school.id) : false;
  const canAdd = compareIds.length < 3 || inCompare;

  if (isLoading) return <DetailSkeleton />;
  if (error || !school) return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <p className="text-gray-500">School not found.</p>
      <Link to="/search" className="btn-primary mt-4 inline-flex">Back to Search</Link>
    </div>
  );

  const programs = school.top_programs ? school.top_programs.split(", ") : [];

  return (
    <div className="min-h-screen bg-cream pb-16">
      {/* Hero */}
      <div className="bg-green-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <Link to="/search" className="inline-flex items-center gap-1.5 text-green-300 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft size={14} /> Back to Search
          </Link>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-2">{school.name}</h1>
              <div className="flex flex-wrap items-center gap-3 text-green-300 text-sm">
                {(school.city || school.state) && (
                  <span className="flex items-center gap-1">
                    <MapPin size={13} />
                    {[school.city, school.state].filter(Boolean).join(", ")}
                  </span>
                )}
                {school.school_type && (
                  <span className="bg-white/10 px-2.5 py-0.5 rounded-full">{school.school_type}</span>
                )}
                {school.locale && (
                  <span className="bg-white/10 px-2.5 py-0.5 rounded-full">{school.locale}</span>
                )}
                {school.size_category && (
                  <span className="bg-white/10 px-2.5 py-0.5 rounded-full">{school.size_category} school</span>
                )}
              </div>
              {school.hbcu && <span className="mt-3 inline-block badge-green text-xs">HBCU</span>}
              {school.hispanic_serving && <span className="mt-3 ml-2 inline-block badge-green text-xs">HSI</span>}
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {school.url && (
                <a
                  href={`https://${school.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-white border-white/20 hover:bg-white/10 hover:border-white hover:text-white text-sm"
                >
                  <Globe size={15} /> Visit Website
                </a>
              )}
              <button
                onClick={() => inCompare ? removeFromCompare(school.id) : addToCompare(school.id)}
                disabled={!canAdd}
                className={clsx(
                  "flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-lg border transition-colors",
                  inCompare
                    ? "bg-orange border-orange text-white"
                    : canAdd
                    ? "border-white/30 text-white hover:bg-white/10"
                    : "border-white/10 text-white/40 cursor-not-allowed"
                )}
              >
                {inCompare ? <><Check size={14} /> In Compare</> : <><GitCompare size={14} /> Add to Compare</>}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-4">
        {/* Key stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <KeyStat
            icon={<TrendingUp className="text-orange" size={18} />}
            label="Acceptance Rate"
            value={fmtPct(school.acceptance_rate, 1)}
            sub={acceptanceLabel(school.acceptance_rate)}
            highlight
          />
          <KeyStat
            icon={<DollarSign className="text-green-700" size={18} />}
            label="Out-of-State Tuition"
            value={fmtDollar(school.tuition_out_state)}
            sub={school.tuition_in_state ? `In-state: ${fmtDollar(school.tuition_in_state)}` : undefined}
          />
          <KeyStat
            icon={<GraduationCap className="text-green-700" size={18} />}
            label="Graduation Rate"
            value={fmtPct(school.graduation_rate, 1)}
            sub={`Retention: ${fmtPct(school.retention_rate, 1)}`}
          />
          <KeyStat
            icon={<Users className="text-green-700" size={18} />}
            label="Undergrad Enrollment"
            value={fmtNum(school.undergrad_enrollment)}
            sub={school.size_category ? `${school.size_category} school` : undefined}
          />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Left column: Admissions + Cost */}
          <div className="md:col-span-2 space-y-6">
            {/* Admissions */}
            <Section icon={<BarChart2 size={18} />} title="Admissions">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                <StatRow label="Acceptance Rate" value={fmtPct(school.acceptance_rate, 1)} />
                <StatRow label="SAT Average" value={fmtSAT(school.sat_avg)} />
                <StatRow label="ACT Midpoint" value={school.act_midpoint ? String(Math.round(school.act_midpoint)) : "—"} />
              </div>
              {school.acceptance_rate != null && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Acceptance Rate</span>
                    <span>{fmtPct(school.acceptance_rate, 1)}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={clsx(
                        "h-full rounded-full",
                        school.acceptance_rate < 0.2 ? "bg-orange" :
                        school.acceptance_rate < 0.5 ? "bg-yellow-400" : "bg-green-500"
                      )}
                      style={{ width: `${Math.round(school.acceptance_rate * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </Section>

            {/* Cost */}
            <Section icon={<DollarSign size={18} />} title="Cost & Financial Aid">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                <StatRow label="In-State Tuition" value={fmtDollar(school.tuition_in_state)} />
                <StatRow label="Out-of-State Tuition" value={fmtDollar(school.tuition_out_state)} />
                <StatRow label="Avg Net Price" value={fmtDollar(school.avg_net_price)} />
                <StatRow label="Median Debt" value={fmtDollar(school.median_debt)} sub="At graduation" />
              </div>
            </Section>

            {/* Outcomes */}
            <Section icon={<TrendingUp size={18} />} title="Outcomes">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                <StatRow label="Graduation Rate" value={fmtPct(school.graduation_rate, 1)} />
                <StatRow label="Retention Rate" value={fmtPct(school.retention_rate, 1)} />
                <StatRow label="Median Earnings (10yr)" value={fmtDollar(school.median_earnings_10yr)} sub="After enrollment" />
              </div>
            </Section>
          </div>

          {/* Right column: Programs + Quick facts */}
          <div className="space-y-6">
            {programs.length > 0 && (
              <Section icon={<BookOpen size={18} />} title="Top Programs">
                <div className="flex flex-wrap gap-2">
                  {programs.map((p) => (
                    <span key={p} className="badge-green text-xs">{p}</span>
                  ))}
                </div>
              </Section>
            )}

            <Section icon={<Heart size={18} />} title="School Profile">
              <div className="space-y-2.5">
                <FactRow label="Type" value={school.school_type || "—"} />
                <FactRow label="Setting" value={school.locale || "—"} />
                <FactRow label="Size" value={school.size_category || "—"} />
                <FactRow label="State" value={school.state || "—"} />
                {school.hbcu && <FactRow label="HBCU" value="Yes" />}
                {school.hispanic_serving && <FactRow label="HSI" value="Yes" />}
                {school.womens_only && <FactRow label="Women's College" value="Yes" />}
                {school.mens_only && <FactRow label="Men's College" value="Yes" />}
              </div>
            </Section>

            <div className="card p-5 bg-green-900 text-white">
              <h4 className="font-bold mb-2">Ready to compare?</h4>
              <p className="text-green-300 text-sm mb-4">Add this school to compare it side-by-side with others.</p>
              <button
                onClick={() => inCompare ? removeFromCompare(school.id) : addToCompare(school.id)}
                disabled={!canAdd}
                className={clsx(
                  "w-full flex items-center justify-center gap-2 font-semibold py-2.5 rounded-lg transition-colors text-sm",
                  inCompare ? "bg-orange text-white" : "bg-white text-green-900 hover:bg-green-50"
                )}
              >
                {inCompare ? <><Check size={14} /> Added to Compare</> : <><GitCompare size={14} /> Add to Compare</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KeyStat({ icon, label, value, sub, highlight }: {
  icon: React.ReactNode; label: string; value: string; sub?: string; highlight?: boolean;
}) {
  return (
    <div className={clsx("card p-5", highlight && "border-orange/30")}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="stat-label text-xs">{label}</span>
      </div>
      <div className="stat-value text-xl">{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
        <span className="text-green-800">{icon}</span>
        <h3 className="font-bold text-green-900">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function StatRow({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <div className="stat-label text-xs mb-0.5">{label}</div>
      <div className="font-bold text-gray-900 text-lg">{value}</div>
      {sub && <div className="text-xs text-gray-400">{sub}</div>}
    </div>
  );
}

function FactRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="min-h-screen bg-cream animate-pulse">
      <div className="bg-green-900 h-48" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-4">
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-2xl" />)}
        </div>
        <div className="h-64 bg-gray-200 rounded-2xl" />
        <div className="h-48 bg-gray-200 rounded-2xl" />
      </div>
    </div>
  );
}
