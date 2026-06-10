import { Bell } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Topbar({ title }) {
  const { user } = useAuth();
  const initials = user?.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "SA";

  return (
    <header className="topbar">
      <span className="topbar-title">{title}</span>
      <div className="topbar-right">
        <span className="live-badge">● Live</span>
        <button className="icon-btn"><Bell size={16} /></button>
        <div className="avatar">{initials}</div>
      </div>
    </header>
  );
}