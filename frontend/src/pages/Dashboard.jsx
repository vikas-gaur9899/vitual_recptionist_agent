import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StatCard from "../components/ui/StatCard";
import Badge from "../components/ui/Badge";
import { getLeadsApi } from "../api/leads.api";
import { getCallsApi } from "../api/calls.api";
import { getAnalyticsApi } from "../api/analytics.api";
import { useAuth } from "../context/AuthContext";

function initials(name) {
  return name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";
}
function duration(s) {
  if (!s) return "—";
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

const BAR_COLORS  = ["#2563eb","#16a34a","#7c3aed","#d97706","#dc2626"];
const RED_COLORS  = ["#dc2626","#ef4444","#f87171","#fca5a5","#fee2e2"];

// ── Not Converted Detail Modal ──
function NotConvertedModal({ course, data, onClose }) {
  if (!course) return null;

  const courseData = data?.notConvertedByCourse?.find(c => c._id === course);
  if (!courseData) return null;

  // Reason count from reasons array
  const reasonCount = {};
  (courseData.reasons || []).forEach(r => {
    if (r) reasonCount[r] = (reasonCount[r] || 0) + 1;
  });
  const sorted = Object.entries(reasonCount).sort((a, b) => b[1] - a[1]);
  const max    = sorted[0]?.[1] || 1;

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: 420, width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 15 }}>Not Converted — {course}</h3>
            <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 4 }}>
              Total: {courseData.count} leads not converted
            </div>
          </div>
          <span style={{ cursor: "pointer", fontSize: 18, color: "var(--text-tertiary)" }} onClick={onClose}>✕</span>
        </div>

        {sorted.length === 0 ? (
          <div style={{ fontSize: 13, color: "var(--text-tertiary)" }}>No reason data available</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {sorted.map(([reason, count], i) => (
              <div key={reason}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 500 }}>{reason}</span>
                  <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{count}</span>
                </div>
                <div style={{ background: "var(--bg-secondary)", borderRadius: 6, height: 8, overflow: "hidden" }}>
                  <div style={{
                    width: `${Math.round((count / max) * 100)}%`,
                    height: "100%",
                    background: RED_COLORS[i % RED_COLORS.length],
                    borderRadius: 6,
                    transition: "width 0.4s"
                  }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [analytics,        setAnalytics]        = useState(null);
  const [leads,            setLeads]            = useState([]);
  const [calls,            setCalls]            = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [selectedNCCourse, setSelectedNCCourse] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    Promise.all([
      getAnalyticsApi().then(r => setAnalytics(r.data)).catch(() => {}),
      getLeadsApi({ limit: 5 }).then(r => setLeads(r.data.leads || [])).catch(() => {}),
      getCallsApi({ limit: 5 }).then(r => setCalls(r.data.calls || [])).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  const courses          = analytics?.courseInterest        || [];
  const notConvByCourse  = analytics?.notConvertedByCourse  || [];
  const notConvByReason  = analytics?.notConvertedByReason  || [];
  const convByCourse     = analytics?.convertedByCourse     || [];

  const maxCourse   = Math.max(...courses.map(c => c.count), 1);
  const maxNotConv  = Math.max(...notConvByCourse.map(c => c.count), 1);
  const maxConv     = Math.max(...convByCourse.map(c => c.count), 1);
  const maxReason   = Math.max(...notConvByReason.map(r => r.count), 1);

  const weekData = analytics?.weekCalls || [0,0,0,0,0,0,0];
  const weekMax  = Math.max(...weekData, 1);
  const days     = ["M","T","W","T","F","S","S"];

  return (
    <div>

      {/* Welcome */}
      <div style={{ marginBottom: 20 }}>
        <h2>Welcome, {user?.name}</h2>
        <p style={{ color: "var(--text-tertiary)" }}>{user?.role}</p>
      </div>

      {/* Stats Row 1 */}
      <div className="stats-grid">
        <StatCard label="Total calls today"  value={analytics?.todayCalls ?? 0}   change="+12% vs yesterday" changeType="up" />
        <StatCard label="Leads generated"    value={analytics?.totalLeads ?? 0}   change="+8% this week"     changeType="up" />
        <StatCard label="Conversion rate"    value={analytics?.conversionRate ? `${analytics.conversionRate}%` : "0%"} change="+3% vs last week" changeType="up" />
        <StatCard label="Avg call duration"  value={analytics?.avgDuration ?? "—"} />
      </div>

      {/* Stats Row 2 */}
      <div className="stats-grid" style={{ marginTop: 16 }}>
        <StatCard label="Converted Leads" value={analytics?.convertedLeads ?? 0} />
        <StatCard label="Complaints"      value={analytics?.complaints ?? 0} />
        <StatCard label="Follow Ups"      value={analytics?.followUps ?? 0} />
        <StatCard label="Executives"      value={analytics?.totalExecutives ?? 0} />
      </div>

      {/* Row 1: week chart + course interest */}
      <div className="two-col" style={{ marginBottom: 16, marginTop: 16 }}>
        <div className="card card-sm">
          <div className="card-title">
            Calls this week
            <span style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 400 }}>Mon–Sun</span>
          </div>
          <div className="week-chart">
            {weekData.map((v, i) => (
              <div key={i}
                className={`week-bar ${i === 6 ? "today" : ""}`}
                style={{ height: `${Math.round((v / weekMax) * 100)}%` }}
                title={`${v} calls`}
              />
            ))}
          </div>
          <div className="week-days">
            {days.map((d, i) => <div key={i} className="week-day">{d}</div>)}
          </div>
        </div>

        <div className="card card-sm">
          <div className="card-title">
            Course interest
            <span style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 400 }}>this month</span>
          </div>
          {courses.length === 0
            ? <div className="empty" style={{ padding: "20px 0" }}>No data yet</div>
            : courses.map((c, i) => (
              <div key={c._id} className="bar-row">
                <div className="bar-label">{c._id || "Unknown"}</div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${Math.round((c.count / maxCourse) * 100)}%`, background: BAR_COLORS[i % BAR_COLORS.length] }} />
                </div>
                <div className="bar-val">{c.count}</div>
              </div>
            ))
          }
        </div>
      </div>

      {/* Row 2: Converted by course + Not Converted by course */}
      <div className="two-col" style={{ marginBottom: 16 }}>

        {/* Converted by course */}
        <div className="card card-sm">
          <div className="card-title">
            ✅ Conversions by Course
            <span style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 400 }}>all time</span>
          </div>
          {convByCourse.length === 0
            ? <div className="empty" style={{ padding: "20px 0" }}>No conversions yet</div>
            : convByCourse.map((c, i) => (
              <div key={c._id} className="bar-row">
                <div className="bar-label">{c._id || "Unknown"}</div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${Math.round((c.count / maxConv) * 100)}%`, background: "#16a34a" }} />
                </div>
                <div className="bar-val" style={{ color: "#16a34a", fontWeight: 600 }}>{c.count}</div>
              </div>
            ))
          }
        </div>

        {/* Not Converted by course — clickable */}
        <div className="card card-sm">
          <div className="card-title">
            ❌ Not Converted by Course
            <span style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 400 }}>click to see reasons</span>
          </div>
          {notConvByCourse.length === 0
            ? <div className="empty" style={{ padding: "20px 0" }}>No data yet</div>
            : notConvByCourse.map((c, i) => (
              <div
                key={c._id}
                className="bar-row"
                onClick={() => setSelectedNCCourse(c._id)}
                style={{ cursor: "pointer", borderRadius: 6, padding: "4px 2px", transition: "background 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--bg-secondary)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <div className="bar-label" style={{ color: "var(--text-primary)" }}>
                  {c._id || "Unknown"}
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${Math.round((c.count / maxNotConv) * 100)}%`, background: "#dc2626" }} />
                </div>
                <div className="bar-val" style={{ color: "#dc2626", fontWeight: 600 }}>{c.count}</div>
              </div>
            ))
          }
        </div>
      </div>

      {/* Not Converted — Top Reasons */}
      {notConvByReason.length > 0 && (
        <div className="card card-sm" style={{ marginBottom: 16 }}>
          <div className="card-title">
            📊 Top Reasons — Not Converted
            <span style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 400 }}>all courses combined</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginTop: 8 }}>
            {notConvByReason.map((r, i) => (
              <div key={r._id} style={{
                background: i === 0 ? "#fef2f2" : "var(--bg-secondary)",
                border: `1px solid ${i === 0 ? "#fca5a5" : "var(--border)"}`,
                borderRadius: 10, padding: "12px 14px"
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: i === 0 ? "#b91c1c" : "var(--text-primary)", marginBottom: 4 }}>
                  {i === 0 && "🔴 "}{r._id}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1, background: "var(--bg-primary)", borderRadius: 4, height: 6, overflow: "hidden" }}>
                    <div style={{ width: `${Math.round((r.count / maxReason) * 100)}%`, height: "100%", background: RED_COLORS[i % RED_COLORS.length], borderRadius: 4 }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#dc2626", minWidth: 24 }}>{r.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Row 3: recent leads + calls */}
      <div className="two-col">
        <div className="card card-sm">
          <div className="card-title">
            Recent leads
            <span className="card-title-link" onClick={() => navigate("/leads")}>View all →</span>
          </div>
          {leads.length === 0
            ? <div className="empty" style={{ padding: "20px 0" }}>No leads yet</div>
            : leads.map(lead => (
              <div key={lead._id} className="lead-row">
                <div className="avatar avatar-sm">{initials(lead.name)}</div>
                <div className="lead-info">
                  <div className="lead-name">{lead.name}</div>
                  <div className="lead-sub">{lead.interest} · {lead.location || "Unknown"}</div>
                </div>
                <Badge label={lead.leadScore || "Cold"} />
              </div>
            ))
          }
        </div>

        <div className="card card-sm">
          <div className="card-title">
            Recent calls
            <span className="card-title-link" onClick={() => navigate("/calls")}>View all →</span>
          </div>
          {calls.length === 0
            ? <div className="empty" style={{ padding: "20px 0" }}>No calls yet</div>
            : calls.map(call => (
              <div key={call._id} className="lead-row">
                <div className={`dot ${call.status === "completed" ? "dot-green" : "dot-red"}`} style={{ marginTop: 2 }} />
                <div className="lead-info">
                  <div className="lead-name">{call.from || call.to || "Unknown"}</div>
                  <div className="lead-sub">{call.intent || "—"} · {call.sentiment || "—"}</div>
                </div>
                <span style={{ fontSize: 12, color: "var(--text-tertiary)", flexShrink: 0 }}>{duration(call.duration)}</span>
              </div>
            ))
          }
        </div>
      </div>

      {/* Not Converted Detail Modal */}
      {selectedNCCourse && (
        <NotConvertedModal
          course={selectedNCCourse}
          data={analytics}
          onClose={() => setSelectedNCCourse(null)}
        />
      )}

    </div>
  );
}