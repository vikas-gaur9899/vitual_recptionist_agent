import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import { Toaster } from "react-hot-toast";

import {
  AuthProvider,
  useAuth
} from "./context/AuthContext";

import Layout from "./components/layout/Layout";

// ── Pages ──
import Login            from "./pages/Login";
import Dashboard        from "./pages/Dashboard";
import ExecutiveDashboard from "./pages/ExecutiveDashboard";
import Leads            from "./pages/Leads";
import MyLeads          from "./pages/MyLeads";
import Calls            from "./pages/Calls";
import Analytics        from "./pages/Analytics";
import Campaigns        from "./pages/Campaigns";
import Courses          from "./pages/Courses";
import Executives       from "./pages/Executives";
import Admins           from "./pages/Admins";
import Leaderboard      from "./pages/Leaderboard";
import ActivityLogs     from "./pages/ActivityLogs";
import Settings         from "./pages/Settings";

// ── Protected Route — login nahi hai toh /login pe bhejo ──
function ProtectedRoute({ children }) {

  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="spinner-wrap" style={{ height: "100vh" }}>
        <div className="spinner" />
      </div>
    );
  }

  return user
    ? children
    : <Navigate to="/login" replace />;
}

// ── App Routes ──
function AppRoutes() {

  const { user } = useAuth();

  return (

    <Routes>

      {/* Login — logged in hai toh dashboard pe bhejo */}
      <Route
        path="/login"
        element={
          user
            ? <Navigate to="/" replace />
            : <Login />
        }
      />

      {/* Main Layout — sab protected routes yahan */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >

        {/* Dashboard — role ke hisaab se alag dashboard */}
        <Route
          index
          element={
            user?.role === "executive"
              ? <ExecutiveDashboard />
              : <Dashboard />
          }
        />

        {/* Leads — admin/super_admin ke liye */}
        <Route path="leads"    element={<Leads />} />

        {/* My Leads — executive ke liye */}
        <Route path="my-leads" element={<MyLeads />} />

        {/* Calls */}
        <Route path="calls" element={<Calls />} />

        {/* Analytics */}
        <Route path="analytics" element={<Analytics />} />

        {/* Campaigns */}
        <Route path="campaigns" element={<Campaigns />} />

        {/* Courses */}
        <Route path="courses" element={<Courses />} />

        {/* Executives — admin/super_admin ke liye */}
        <Route path="executives" element={<Executives />} />

        {/* Admins — sirf super_admin ke liye */}
        <Route path="admins" element={<Admins />} />

        {/* Leaderboard — executive performance ranking */}
        <Route path="leaderboard" element={<Leaderboard />} />

        {/* Activity Logs — audit trail */}
        <Route path="activity" element={<ActivityLogs />} />

        {/* Settings — profile + password */}
        <Route path="settings" element={<Settings />} />

      </Route>

    </Routes>
  );
}

// ── Root App ──
export default function App() {

  return (

    <AuthProvider>

      <BrowserRouter>

        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontSize: "13px",
              borderRadius: "10px"
            }
          }}
        />

        <AppRoutes />

      </BrowserRouter>

    </AuthProvider>
  );
}