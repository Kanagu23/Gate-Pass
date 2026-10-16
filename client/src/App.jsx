
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import HomeRedirect from "./routes/HomeRedirect";
import VisitorPassPage from "./pages/visitor/VisitorPassPage";
import Login from "./pages/auth/login";
import DashboardPage from "./pages/dashboard/DashboardPage";
import AppLayout from "./layouts/AppLayout";
import Unauthorized from "./pages/errors/Unauthorized";
import NotFound from "./pages/errors/NotFound";


const roleHome = {
  ADMIN: "/admin",
  GATE_EMPLOYEE: "/gate",
  EMPLOYEE: "/employee",
  DIRECTOR: "/director",
};

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-slate-500">
          Checking your session...
        </p>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={<HomeRedirect roleHome={roleHome} />}
      />

      <Route
        path="/login"
        element={
          user ? (
            <Navigate
              to={roleHome[user.role] || "/unauthorized"}
              replace
            />
          ) : (
            <Login />
          )
        }
      />

      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
        <Route element={<AppLayout />}>
          <Route
            path="/admin"
            element={<DashboardPage role="ADMIN" />}
          />
            <Route
      path="/admin/visitors/:id/pass"
      element={<VisitorPassPage />}
    />
        </Route>
      
      </Route>

      <Route
        element={
          <ProtectedRoute allowedRoles={["GATE_EMPLOYEE"]} />
        }
      >
        <Route element={<AppLayout />}>
          <Route
            path="/gate"
            element={<DashboardPage role="GATE_EMPLOYEE" />}
          />
           <Route
      path="/gate/visitors/:id/pass"
      element={<VisitorPassPage />}
    />
        </Route>
      </Route>

      <Route
        element={<ProtectedRoute allowedRoles={["EMPLOYEE"]} />}
      >
        <Route element={<AppLayout />}>
          <Route
            path="/employee"
            element={<DashboardPage role="EMPLOYEE" />}
          />
        </Route>
      </Route>

      <Route
        element={<ProtectedRoute allowedRoles={["DIRECTOR"]} />}
      >
        <Route element={<AppLayout />}>
          <Route
            path="/director"
            element={<DashboardPage role="DIRECTOR" />}
          />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;