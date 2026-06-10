import { useEffect, useState } from "react";
import { getLeadsApi } from "../api/leads.api";

export default function ExecutiveDashboard() {

  const [stats, setStats] =
    useState({

      total: 0,

      converted: 0,

      followUps: 0,

      complaints: 0
    });

  useEffect(() => {

    const loadData =
      async () => {

        try {

          const res =
            await getLeadsApi({
              myLeads: true
            });

          const leads =
            res.data.leads || [];

          setStats({

            total:
              leads.length,

            converted:
              leads.filter(
                l =>
                  l.status ===
                  "Converted"
              ).length,

            followUps:
              leads.filter(
                l =>
                  l.status ===
                  "Follow-up"
              ).length,

            complaints:
              leads.filter(
                l =>
                  l.type ===
                  "complaint"
              ).length
          });

        } catch {

          console.error(
            "Dashboard error"
          );
        }
      };

    loadData();

  }, []);

  return (

    <div>

      <div className="stats-grid">

        <div className="stat-card">

          <h4>
            Assigned Leads
          </h4>

          <h2>
            {stats.total}
          </h2>

        </div>

        <div className="stat-card">

          <h4>
            Converted
          </h4>

          <h2>
            {stats.converted}
          </h2>

        </div>

        <div className="stat-card">

          <h4>
            Follow Ups
          </h4>

          <h2>
            {stats.followUps}
          </h2>

        </div>

        <div className="stat-card">

          <h4>
            Complaints
          </h4>

          <h2>
            {stats.complaints}
          </h2>

        </div>

      </div>

    </div>
  );
}