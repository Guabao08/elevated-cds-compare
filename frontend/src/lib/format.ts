export const fmtPct = (v: number | null | undefined, decimals = 0) =>
  v != null ? `${(v * 100).toFixed(decimals)}%` : "—";

export const fmtDollar = (v: number | null | undefined) =>
  v != null ? `$${v.toLocaleString()}` : "—";

export const fmtNum = (v: number | null | undefined) =>
  v != null ? v.toLocaleString() : "—";

export const fmtSAT = (v: number | null | undefined) =>
  v != null ? Math.round(v).toLocaleString() : "—";

export const acceptanceLabel = (rate: number | null | undefined): string => {
  if (rate == null) return "Unknown";
  const pct = rate * 100;
  if (pct < 10) return "Most Selective";
  if (pct < 25) return "Highly Selective";
  if (pct < 50) return "Selective";
  if (pct < 75) return "Moderately Selective";
  return "Open Admission";
};

export const acceptanceColor = (rate: number | null | undefined): string => {
  if (rate == null) return "badge-gray";
  if (rate < 0.1) return "badge-orange";
  if (rate < 0.25) return "badge-orange";
  if (rate < 0.5) return "badge-green";
  return "badge-gray";
};

export const tierColor = (tier: string) => {
  if (tier === "Reach") return "bg-orange-pale text-orange-dark border border-orange-light";
  if (tier === "Target") return "bg-green-100 text-green-900 border border-green-200";
  return "bg-blue-50 text-blue-700 border border-blue-200";
};

export const tierDot = (tier: string) => {
  if (tier === "Reach") return "bg-orange";
  if (tier === "Target") return "bg-green-700";
  return "bg-blue-500";
};

export const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC",
];
