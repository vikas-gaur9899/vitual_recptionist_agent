import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const API = axios.create({ baseURL: import.meta.env.VITE_API_URL });
API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

const MEDAL = ["🥇", "🥈", "🥉"];

function StatPill({ label, value, color }) {
    return (
        <div style={{
            background: color,
            borderRadius: 8,
            padding: "4px 10px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            minWidth: 54
        }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                {value}
            </span>
            <span style={{ fontSize: 10, color: "var(--text-tertiary)" }}>
                {label}
            </span>
        </div>
    );
}

export default function Leaderboard() {

    const [data,    setData]    = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        API.get("/api/users/leaderboard")
            .then(res => setData(res.data.data || []))
            .catch(() => toast.error("Failed to load leaderboard"))
            .finally(() => setLoading(false));
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

            <div style={{ marginBottom: 24 }}>
                <h2>Executive Leaderboard</h2>
                <p style={{ color: "var(--text-tertiary)", fontSize: 13, marginTop: 4 }}>
                    Score = Conversions × 10 + Calls × 2 + Conversion Rate × 3 − Complaints × 5
                </p>
            </div>

            {data.length === 0 && (
                <div className="empty">No executives found</div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {data.map((exec, index) => (
                    <div
                        key={exec._id}
                        className="card card-sm"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 16,
                            border: index === 0
                                ? "1.5px solid #f59e0b"
                                : "1px solid var(--border)"
                        }}
                    >

                        {/* Rank */}
                        <div style={{
                            fontSize: index < 3 ? 28 : 16,
                            fontWeight: 700,
                            color: "var(--text-tertiary)",
                            width: 36,
                            textAlign: "center",
                            flexShrink: 0
                        }}>
                            {index < 3 ? MEDAL[index] : `#${index + 1}`}
                        </div>

                        {/* Avatar + Name */}
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                            <div className="avatar">
                                {exec.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                            </div>
                            <div style={{ minWidth: 0 }}>
                                <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text-primary)" }}>
                                    {exec.name}
                                </div>
                                <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
                                    {exec.email}
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                            <StatPill label="Leads"      value={exec.totalLeads}      color="var(--blue-light)"   />
                            <StatPill label="Converted"  value={exec.converted}       color="var(--green-light)"  />
                            <StatPill label="Calls"      value={exec.callsHandled}    color="var(--purple-light)" />
                            <StatPill label="Rate"       value={`${exec.conversionRate}%`} color="var(--amber-light)"  />
                            <StatPill label="Complaints" value={exec.complaints}      color="var(--red-light)"    />
                        </div>

                        {/* Score */}
                        <div style={{
                            flexShrink: 0,
                            textAlign: "center",
                            background: index === 0 ? "#fffbeb" : "var(--bg-secondary)",
                            border: index === 0 ? "1px solid #f59e0b" : "1px solid var(--border)",
                            borderRadius: 10,
                            padding: "8px 14px"
                        }}>
                            <div style={{
                                fontSize: 20,
                                fontWeight: 700,
                                color: index === 0 ? "#d97706" : "var(--text-primary)"
                            }}>
                                {exec.score}
                            </div>
                            <div style={{ fontSize: 10, color: "var(--text-tertiary)" }}>
                                SCORE
                            </div>
                        </div>

                    </div>
                ))}
            </div>

        </div>
    );
}