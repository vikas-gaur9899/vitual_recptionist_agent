import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, Phone, BarChart2, Megaphone, Settings, ClipboardList, Activity, LogOut, BookOpen, Trophy, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Sidebar() {

  const { logout, user } = useAuth();
  const role = user?.role;

  const superAdminNav = [
    { to: "/",            icon: LayoutDashboard, label: "Dashboard" },
    { to: "/courses",     icon: BookOpen,        label: "Courses" },
    { to: "/admins",      icon: ShieldCheck,     label: "Admins" },
    { to: "/executives",  icon: Users,           label: "Executives" },
    { to: "/leaderboard", icon: Trophy,          label: "Leaderboard" },
    { to: "/leads",       icon: ClipboardList,   label: "Leads" },
    { to: "/calls",       icon: Phone,           label: "Calls" },
    { to: "/campaigns",   icon: Megaphone,       label: "Campaigns" },
    { to: "/analytics",   icon: BarChart2,       label: "Analytics" },
    { to: "/activity",    icon: Activity,        label: "Activity Logs" }
  ];

  const adminNav = [
    { to: "/",            icon: LayoutDashboard, label: "Dashboard" },
    { to: "/courses",     icon: BookOpen,        label: "Courses" },
    { to: "/executives",  icon: Users,           label: "Executives" },
    { to: "/leaderboard", icon: Trophy,          label: "Leaderboard" },
    { to: "/leads",       icon: ClipboardList,   label: "Leads" },
    { to: "/calls",       icon: Phone,           label: "Calls" },
    { to: "/campaigns",   icon: Megaphone,       label: "Campaigns" },
    { to: "/analytics",   icon: BarChart2,       label: "Analytics" },
    { to: "/activity",    icon: Activity,        label: "Activity Logs" }
  ];

  const executiveNav = [
    { to: "/",         icon: LayoutDashboard, label: "Dashboard" },
    { to: "/my-leads", icon: ClipboardList,   label: "My Leads" },
    { to: "/calls",    icon: Phone,           label: "Calls" }
  ];

  let nav = [];
  if (role === "super_admin") {
    nav = superAdminNav;
  } else if (role === "admin") {
    nav = adminNav;
  } else {
    nav = executiveNav;
  }

  return (
    <aside className="sidebar">

      <div className="sidebar-logo">
        <div className="sidebar-logo-title">Genesis Ed-Tech</div>
        <div className="sidebar-logo-sub">CRM Dashboard</div>
      </div>

      <nav className="sidebar-nav">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            <Icon size={15} strokeWidth={1.8} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <NavLink to="/settings" className="nav-link">
          <Settings size={15} strokeWidth={1.8} />
          Settings
        </NavLink>
        <button
          className="nav-link"
          onClick={logout}
          style={{ color: "#ef4444" }}
        >
          <LogOut size={15} strokeWidth={1.8} />
          Logout
        </button>
      </div>

      <div className="sidebar-user">
        <div className="sidebar-user-name">{user?.name || "User"}</div>
        <div className="sidebar-user-role">{user?.role || "Executive"}</div>
      </div>

    </aside>
  );
}