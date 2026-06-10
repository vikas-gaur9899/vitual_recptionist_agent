import { useEffect, useState } from "react";
import { getAnalyticsApi } from "../api/analytics.api";
import StatCard from "../components/ui/StatCard";

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalyticsApi()
      .then((res) => {
        setData(res.data);
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="spinner-wrap">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div>
      <div className="stats-grid">
        <StatCard
          label="Total Calls"
          value={data?.totalCalls ?? data?.callsHandled ?? 0}
        />

        <StatCard
          label="Total Leads"
          value={data?.totalLeads ?? data?.assignedLeads ?? data?.myLeads ?? 0}
        />

        <StatCard
          label="Converted Leads"
          value={data?.convertedLeads ?? data?.converted ?? 0}
        />

        <StatCard
          label="Conversion Rate"
          value={data?.conversionRate ? `${data.conversionRate}%` : "0%"}
        />
      </div>

      <div className="stats-grid" style={{ marginTop: 20 }}>
        <StatCard
          label="Follow Ups"
          value={data?.followUps ?? 0}
        />

        <StatCard
          label="Complaints"
          value={data?.complaints ?? 0}
        />

        <StatCard
          label="Executives"
          value={data?.totalExecutives ?? 0}
        />

        <StatCard
          label="Admins"
          value={data?.totalAdmins ?? 0}
        />
      </div>

      <div className="card card-sm" style={{ marginTop: 20 }}>
        <div className="card-title">
          CRM Overview
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
            gap: 16,
            marginTop: 16
          }}
        >
          <div>
            <div
              style={{
                fontSize: 12,
                color: "var(--text-tertiary)"
              }}
            >
              Total Leads
            </div>

            <div
              style={{
                fontSize: 22,
                fontWeight: 600
              }}
            >
              {data?.totalLeads ?? data?.assignedLeads ?? data?.myLeads ?? 0}
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: 12,
                color: "var(--text-tertiary)"
              }}
            >
              Converted Leads
            </div>

            <div
              style={{
                fontSize: 22,
                fontWeight: 600
              }}
            >
              {data?.convertedLeads ?? data?.converted ?? 0}
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: 12,
                color: "var(--text-tertiary)"
              }}
            >
              Follow Ups
            </div>

            <div
              style={{
                fontSize: 22,
                fontWeight: 600
              }}
            >
              {data?.followUps ?? 0}
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: 12,
                color: "var(--text-tertiary)"
              }}
            >
              Complaints
            </div>

            <div
              style={{
                fontSize: 22,
                fontWeight: 600
              }}
            >
              {data?.complaints ?? 0}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}