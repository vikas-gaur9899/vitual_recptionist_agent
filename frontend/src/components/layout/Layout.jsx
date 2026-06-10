import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const titles = {
  "/":          "Dashboard",
  "/leads":     "Leads",
  "/calls":     "Call Logs",
  "/analytics": "Analytics",
  "/campaigns": "Campaigns",
};

export default function Layout() {
  const { pathname } = useLocation();
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-area">
        <Topbar title={titles[pathname] || "Dashboard"} />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}