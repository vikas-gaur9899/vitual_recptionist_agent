const map = {
  Hot: "badge-hot", Warm: "badge-warm", Cold: "badge-cold",
  New: "badge-new", Contacted: "badge-contacted", Qualified: "badge-qualified",
  Positive: "badge-positive", Neutral: "badge-neutral", Negative: "badge-negative",
  completed: "badge-completed", "no-answer": "badge-noanswer", failed: "badge-failed",
  Online: "badge-online", Offline: "badge-offline", Both: "badge-both",
};

export default function Badge({ label }) {
  if (!label) return null;
  return (
    <span className={`badge ${map[label] || "badge-neutral"}`}>{label}</span>
  );
}