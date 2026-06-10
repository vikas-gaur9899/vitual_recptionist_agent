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

const BAR_COLORS = ["#2563eb","#16a34a","#7c3aed","#d97706","#dc2626"];

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [leads,     setLeads]     = useState([]);
  const [calls,     setCalls]     = useState([]);
  const [loading,   setLoading]   = useState(true);
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

  const courses = analytics?.courseInterest || [];
  const maxCourse = Math.max(...courses.map(c => c.count), 1);
  const weekData = analytics?.weekCalls || [12, 19, 24, 18, 35, 30, 47];
  const weekMax  = Math.max(...weekData, 1);
  const days     = ["M","T","W","T","F","S","S"];
  

  return (
    <div>
      <div
  style={{
    marginBottom: 20
  }}
>
  <h2>
    Welcome, {user?.name}
  </h2>

  <p
    style={{
      color: "var(--text-tertiary)"
    }}
  >
    {user?.role}
  </p>
</div>
      {/* Stats */}
      <div className="stats-grid">
        <StatCard label="Total calls today"  value={analytics?.todayCalls ?? 0}   change="+12% vs yesterday" changeType="up" />
        <StatCard label="Leads generated"    value={analytics?.totalLeads ?? 0}   change="+8% this week"     changeType="up" />
        <StatCard label="Conversion rate"    value={analytics?.conversionRate ? `${analytics.conversionRate}%` : "0%"} change="+3% vs last week" changeType="up" />
        <StatCard label="Avg call duration"  value={analytics?.avgDuration ?? "—"} />
      </div>
<div
  className="stats-grid"
  style={{
    marginTop: 16
  }}
>

  <StatCard
    label="Converted Leads"
    value={analytics?.convertedLeads ?? 0}
  />

  <StatCard
    label="Complaints"
    value={analytics?.complaints ?? 0}
  />

  <StatCard
    label="Follow Ups"
    value={analytics?.followUps ?? 0}
  />

  <StatCard
    label="Executives"
    value={analytics?.totalExecutives ?? 0}
  />

</div>
      {/* Row 1: week chart + course bars */}
      <div className="two-col" style={{ marginBottom: 16 }}>
        <div className="card card-sm">
          <div className="card-title">
            Calls this week
            <span style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 400 }}>Mon–Sun</span>
          </div>
          <div className="week-chart">
            {weekData.map((v, i) => (
              <div
                key={i}
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

      {/* Row 2: recent leads + calls */}
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
    </div>
  );
}