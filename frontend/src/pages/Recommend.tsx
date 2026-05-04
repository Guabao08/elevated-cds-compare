import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { fetchRecommendations } from "../api/schools";
import { Link } from "react-router-dom";
import { useCompare } from "../context/CompareContext";
import { fmtPct, fmtDollar, tierColor, tierDot, US_STATES } from "../lib/format";
import { Sparkles, GitCompare, Check, ChevronRight, Loader2, MapPin } from "lucide-react";
import type { RecommendRequest, RecommendedSchool } from "../types";
import clsx from "clsx";

const PRIORITIES = [
  "Strong research opportunities", "Low student debt", "Strong alumni network",
  "Warm weather", "Urban campus", "Division I athletics", "Greek life",
  "Strong internship pipeline", "Diverse student body", "Small class sizes",
  "Strong graduate school placement", "Affordable cost of attendance",
];

const MAJORS = [
  "Computer Science", "Business / Finance", "Engineering", "Biology / Pre-Med",
  "Psychology", "Communications", "Political Science", "Economics",
  "Nursing", "Education", "Art & Design", "Undecided",
];

export default function RecommendPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<Partial<RecommendRequest>>({});
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);

  const { mutate, data, isPending, error, reset } = useMutation({
    mutationFn: (req: RecommendRequest) => fetchRecommendations(req),
  });

  const { addToCompare, isInCompare, compareIds } = useCompare();

  const handleSubmit = () => {
    const req: RecommendRequest = {
      gpa: Number(form.gpa) || 3.0,
      sat: form.sat ? Number(form.sat) : undefined,
      act: form.act ? Number(form.act) : undefined,
      budget: form.budget ? Number(form.budget) : undefined,
      state_preference: form.state_preference || undefined,
      intended_major: form.intended_major || undefined,
      school_size: form.school_size || undefined,
      locale_preference: form.locale_preference || undefined,
      priorities: selectedPriorities.length > 0 ? selectedPriorities : undefined,
    };
    mutate(req);
    setStep(3);
  };

  const togglePriority = (p: string) => {
    setSelectedPriorities((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : prev.length < 5 ? [...prev, p] : prev
    );
  };

  if (step === 3) {
    return (
      <div className="min-h-screen bg-cream pb-20">
        <div className="page-header py-8 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-1">Your College List</h1>
            <p className="text-green-300 text-sm">AI-powered Reach / Target / Safety recommendations</p>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          {isPending && (
            <div className="card p-16 text-center">
              <Loader2 size={36} className="text-orange animate-spin mx-auto mb-4" />
              <p className="font-semibold text-green-900 text-lg">Building your college list...</p>
              <p className="text-gray-500 text-sm mt-1">Our AI is matching your profile to thousands of schools</p>
            </div>
          )}

          {error && (
            <div className="card p-8 text-center border-red-200">
              <p className="text-red-600 font-medium mb-4">Something went wrong generating recommendations.</p>
              <button onClick={() => { reset(); setStep(1); }} className="btn-primary">
                Try Again
              </button>
            </div>
          )}

          {data && (
            <>
              {/* Profile summary */}
              <div className="card p-5 mb-6 bg-green-900 text-white flex items-start gap-3">
                <Sparkles size={18} className="text-orange mt-0.5 shrink-0" />
                <p className="text-sm text-green-100 leading-relaxed">{data.profile_summary}</p>
              </div>

              {/* Tier groups */}
              {(["Reach", "Target", "Safety"] as const).map((tier) => {
                const tierSchools = data.schools.filter((s) => s.tier === tier);
                if (!tierSchools.length) return null;
                return (
                  <div key={tier} className="mb-8">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`w-3 h-3 rounded-full ${tierDot(tier)}`} />
                      <h2 className="text-lg font-bold text-green-900">{tier} Schools</h2>
                      <span className="badge-gray text-xs">{tierSchools.length}</span>
                    </div>
                    <div className="space-y-4">
                      {tierSchools.map((item) => (
                        <RecommendCard key={item.school.id} item={item} />
                      ))}
                    </div>
                  </div>
                );
              })}

              <div className="flex items-center justify-center gap-3 mt-8">
                <button
                  onClick={() => { reset(); setStep(1); }}
                  className="btn-secondary"
                >
                  Adjust Profile
                </button>
                {compareIds.length > 0 && (
                  <Link to="/compare" className="btn-primary">
                    <GitCompare size={15} /> View Comparison
                  </Link>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pb-20">
      <div className="page-header py-8 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 text-green-300 text-sm mb-3">
            <span className={clsx("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold", step >= 1 ? "bg-orange text-white" : "bg-white/20")}>1</span>
            <span className="w-8 h-px bg-white/20" />
            <span className={clsx("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold", step >= 2 ? "bg-orange text-white" : "bg-white/20")}>2</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-1">
            {step === 1 ? "Your Academic Profile" : "Preferences & Priorities"}
          </h1>
          <p className="text-green-300 text-sm">
            {step === 1 ? "Tell us about your grades and test scores" : "What matters most to you in a college?"}
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {step === 1 && (
          <div className="card p-8 space-y-6">
            <FormField label="GPA (on 4.0 scale)" required>
              <div className="flex items-center gap-3">
                <input
                  type="range" min="0" max="4" step="0.1"
                  value={form.gpa ?? 3.5}
                  onChange={(e) => setForm((p) => ({ ...p, gpa: parseFloat(e.target.value) }))}
                  className="flex-1 accent-green-900"
                />
                <span className="w-12 text-right font-bold text-green-900 text-lg">
                  {(form.gpa ?? 3.5).toFixed(1)}
                </span>
              </div>
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="SAT Score (optional)">
                <input
                  type="number" placeholder="e.g. 1350" min={400} max={1600}
                  value={form.sat ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, sat: e.target.value ? Number(e.target.value) : undefined }))}
                  className="input"
                />
              </FormField>
              <FormField label="ACT Score (optional)">
                <input
                  type="number" placeholder="e.g. 28" min={1} max={36}
                  value={form.act ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, act: e.target.value ? Number(e.target.value) : undefined }))}
                  className="input"
                />
              </FormField>
            </div>

            <FormField label="Annual Budget (tuition + fees)">
              <div className="flex items-center gap-3">
                <input
                  type="range" min={5000} max={80000} step={1000}
                  value={form.budget ?? 40000}
                  onChange={(e) => setForm((p) => ({ ...p, budget: Number(e.target.value) }))}
                  className="flex-1 accent-green-900"
                />
                <span className="w-20 text-right font-bold text-green-900">
                  {fmtDollar(form.budget ?? 40000)}
                </span>
              </div>
            </FormField>

            <FormField label="Intended Major">
              <select
                value={form.intended_major ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, intended_major: e.target.value }))}
                className="select"
              >
                <option value="">Select a major</option>
                {MAJORS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </FormField>

            <button
              onClick={() => setStep(2)}
              disabled={!form.gpa && form.gpa !== 0}
              className="btn-primary w-full justify-center py-3"
            >
              Next: Preferences <ChevronRight size={16} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="card p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Preferred State">
                <select
                  value={form.state_preference ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, state_preference: e.target.value }))}
                  className="select"
                >
                  <option value="">No preference</option>
                  {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </FormField>

              <FormField label="School Size">
                <select
                  value={form.school_size ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, school_size: e.target.value }))}
                  className="select"
                >
                  <option value="">No preference</option>
                  <option value="Small">Small (&lt;2,000)</option>
                  <option value="Medium">Medium (2K–15K)</option>
                  <option value="Large">Large (15K+)</option>
                </select>
              </FormField>

              <FormField label="Campus Setting">
                <select
                  value={form.locale_preference ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, locale_preference: e.target.value }))}
                  className="select"
                >
                  <option value="">No preference</option>
                  <option value="City">City</option>
                  <option value="Suburb">Suburb</option>
                  <option value="Town">Town</option>
                  <option value="Rural">Rural</option>
                </select>
              </FormField>
            </div>

            <FormField label={`Priorities (select up to 5) — ${selectedPriorities.length}/5 selected`}>
              <div className="flex flex-wrap gap-2 mt-1">
                {PRIORITIES.map((p) => {
                  const selected = selectedPriorities.includes(p);
                  const disabled = !selected && selectedPriorities.length >= 5;
                  return (
                    <button
                      key={p}
                      onClick={() => togglePriority(p)}
                      disabled={disabled}
                      className={clsx(
                        "badge text-xs transition-colors",
                        selected ? "bg-green-900 text-white" :
                        disabled ? "bg-gray-100 text-gray-300 cursor-not-allowed" :
                        "bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-900"
                      )}
                    >
                      {selected && <Check size={10} className="mr-1" />}{p}
                    </button>
                  );
                })}
              </div>
            </FormField>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-secondary flex-1 justify-center">
                Back
              </button>
              <button onClick={handleSubmit} className="btn-primary flex-1 justify-center py-3">
                <Sparkles size={16} /> Get My Recommendations
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function RecommendCard({ item }: { item: RecommendedSchool }) {
  const { school, tier, fit_score, reasoning } = item;
  const { addToCompare, removeFromCompare, isInCompare, compareIds } = useCompare();
  const inCompare = isInCompare(school.id);
  const canAdd = compareIds.length < 3 || inCompare;

  return (
    <div className="card p-5 hover:shadow-card-hover transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={clsx("badge text-xs font-bold", tierColor(tier))}>{tier}</span>
            <span className="text-xs text-gray-400">Fit score: {fit_score}/100</span>
          </div>
          <Link to={`/schools/${school.id}`} className="font-bold text-green-900 hover:text-orange transition-colors text-lg leading-snug">
            {school.name}
          </Link>
          <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
            <MapPin size={11} />
            {[school.city, school.state].filter(Boolean).join(", ")}
            {school.school_type && <span className="ml-2 bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{school.school_type}</span>}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-sm font-bold text-gray-900">{fmtPct(school.acceptance_rate, 1)}</div>
          <div className="text-xs text-gray-400">acceptance</div>
          <div className="text-sm font-bold text-gray-900 mt-1">{fmtDollar(school.tuition_out_state)}</div>
          <div className="text-xs text-gray-400">out-of-state</div>
        </div>
      </div>

      <p className="text-sm text-gray-600 mt-3 leading-relaxed border-t border-gray-50 pt-3">{reasoning}</p>

      <div className="flex items-center gap-2 mt-3">
        <Link to={`/schools/${school.id}`} className="text-sm font-medium text-green-900 hover:text-orange transition-colors">
          View Details <ChevronRight size={12} className="inline" />
        </Link>
        <button
          onClick={() => inCompare ? removeFromCompare(school.id) : addToCompare(school.id)}
          disabled={!canAdd}
          className={clsx(
            "ml-auto flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors",
            inCompare ? "bg-green-900 text-white border-green-900" :
            canAdd ? "border-gray-200 text-gray-600 hover:border-green-800 hover:text-green-900" :
            "border-gray-100 text-gray-300 cursor-not-allowed"
          )}
        >
          {inCompare ? <><Check size={11} /> Added</> : <><GitCompare size={11} /> Compare</>}
        </button>
      </div>
    </div>
  );
}

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-orange ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}
