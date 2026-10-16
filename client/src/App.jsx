
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import Login from "./pages/auth/login";

const roleHome = {
  ADMIN: "/admin",
  GATE_EMPLOYEE: "/gate",
  EMPLOYEE: "/employee",
  DIRECTOR: "/director",
};

function HomeRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return <p className="p-8 text-center">Loading...</p>;
  }

  return (
    <Navigate
      to={user ? roleHome[user.role] || "/unauthorized" : "/login"}
      replace
    />
  );
}

const DashboardPage=({ title })=>{
  const { user, logout } = useAuth();

  async function handleLogout() {
    try {
      await logout();
    } finally {
      window.location.href = "/login";
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {title}
          </h1>
          <p className="mt-1 text-slate-600">
            Welcome, {user?.name}
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        >
          Logout
        </button>
      </header>

      <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">
          Gate Pass Overview
        </h2>
        <p className="mt-2 text-slate-600">
          Your dashboard is connected. Visitor statistics and
          role-specific features will be added next.
        </p>
      </section>
    </main>
  );
}

const Unauthorized = () => {
  return (
    <main className="p-8 text-center">
      <h1 className="text-2xl font-bold">Access denied</h1>
      <p className="mt-2">You don't have permission to view this page.</p>
      <a className="mt-4 inline-block text-blue-700 underline" href="/">
        Go to your dashboard
      </a>
    </main>
  );
}
const NotFound = () => {
  return (
    <main className="p-8 text-center">
      <h1 className="text-2xl font-bold">404 — Page not found</h1>
      <a className="mt-4 inline-block text-blue-700 underline" href="/">
        Return home
      </a>
    </main>
  );
}

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
          <Route
            path="/admin"
            element={<DashboardPage title="Admin Dashboard" />}
          />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["GATE_EMPLOYEE"]} />}>
          <Route
            path="/gate"
            element={<DashboardPage title="Gate Employee Dashboard" />}
          />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["EMPLOYEE"]} />}>
          <Route
            path="/employee"
            element={<DashboardPage title="Employee Dashboard" />}
          />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["DIRECTOR"]} />}>
          <Route
            path="/director"
            element={<DashboardPage title="Director Dashboard" />}
          />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;