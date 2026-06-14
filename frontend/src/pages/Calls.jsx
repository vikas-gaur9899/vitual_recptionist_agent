import { useEffect, useState } from "react";
import { getCallsApi } from "../api/calls.api";
import Badge from "../components/ui/Badge";

function duration(s) {
  if (!s) return "—";
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

// ✅ Direction label helper
function directionLabel(dir) {
  if (dir === "outbound-api") return "Outbound";
  if (dir === "inbound")      return "Inbound";
  return "—";
}

export default function Calls() {
  const [calls,    setCalls]    = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    getCallsApi({ limit: 50 })
      .then(r => setCalls(r.data.calls || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  return (
    <div>
      {calls.length === 0 && <div className="empty">No calls yet</div>}
      {calls.map(call => (
        <div key={call._id} className="call-card">
          <div className="call-header" onClick={() => setExpanded(expanded === call._id ? null : call._id)}>
            <div className={`call-dot ${call.status === "completed" ? "dot-green" : "dot-red"}`} />
            <div className="call-info">
              <div className="call-num">{call.from || call.to || "Unknown"}</div>
              <div className="call-meta">
                {new Date(call.createdAt).toLocaleString("en-IN")} · {call.intent || "—"}
              </div>
            </div>
            <div className="call-badges">
              {/* ✅ Direction badge */}
              <span
                className={`badge ${call.direction === "outbound-api" ? "badge-outbound" : "badge-inbound"}`}
              >
                {directionLabel(call.direction)}
              </span>
              <Badge label={call.status} />
              {call.sentiment && <Badge label={call.sentiment} />}
              {call.leadGenerated && <span className="badge badge-lead">Lead</span>}
            </div>
            <div className="call-dur">{duration(call.duration)}</div>
            <div className="call-chevron">{expanded === call._id ? "▲" : "▼"}</div>
          </div>

          {expanded === call._id && (
            <div className="call-expanded">
              {call.summary && (
                <div style={{ marginBottom: 14 }}>
                  <div className="call-section-title">Summary</div>
                  <div className="call-summary-text">{call.summary}</div>
                </div>
              )}
              {call.transcript?.length > 0 && (
                <div>
                  <div className="call-section-title">Transcript</div>
                  <div className="transcript">
                    {call.transcript.map((t, i) => (
                      <div key={i} className={`msg ${t.role}`}>
                        <div className="msg-bubble">{t.text}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}