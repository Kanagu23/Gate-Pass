
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { useAuth } from "./context/AuthContext";
import { roleHome } from "./config/navigation";

import PageLoader from "./components/common/PageLoader";
import ProtectedRoute from "./routes/ProtectedRoute";
import HomeRedirect from "./routes/HomeRedirect";

import Login from "./pages/auth/login";
import DashboardPage from "./pages/dashboard/DashboardPage";
import AppLayout from "./layouts/AppLayout";

import Unauthorized from "./pages/errors/Unauthorized";
import NotFound from "./pages/errors/NotFound";

import VisitorPassPage from "./pages/visitor/VisitorPassPage";
import VisitorRegistrationPage from "./pages/visitor/VisitorRegistrationPage";
import VisitorApprovalPage from "./pages/visitor/VisitorApprovalPage";
import VisitorListPage from "./pages/visitor/VisitorListPage";
import VisitorCheckoutPage from "./pages/visitor/VisitorCheckoutPage";
import VisitorHistoryPage from "./pages/visitor/VisitorHistoryPage";

import CreateUserPage from "./pages/admin/CreateUserPage";
import DepartmentManagementPage from "./pages/admin/DepartmentManagementPage";
import UserManagementPage from "./pages/admin/UserManagementPage";

// Check whether a user can register visitors.
const canRegisterVisitor = (user) => {
  if (!user) return false;

  return (
    ["ADMIN", "GATE_EMPLOYEE"].includes(user.role) ||
    user.permissions?.includes("visitor.register")
  );
};

const canViewVisitors = (user) => {
  if (!user) return false;

  return (
    ["ADMIN", "GATE_EMPLOYEE"].includes(user.role) ||
    (
      ["EMPLOYEE", "DIRECTOR"].includes(user.role) &&
      user.permissions?.includes("visitor.view")
    )
  );
};


const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <PageLoader label="Checking your session..." />
    );
  }

  return (
    <Routes>
      {/* Home */}
      <Route
        path="/"
        element={<HomeRedirect roleHome={roleHome} />}
      />

      {/* Authentication */}
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

      <Route
        path="/unauthorized"
        element={<Unauthorized />}
      />

      {/* ADMIN */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]} />
        }
      >
        <Route element={<AppLayout />}>
          <Route
            path="/admin"
            element={<DashboardPage role="ADMIN" />}
          />

          <Route
            path="/admin/visitors"
            element={<VisitorListPage />}
          />

          <Route
            path="/admin/visitors/register"
            element={<VisitorRegistrationPage />}
          />

          <Route
            path="/admin/visitors/check-out"
            element={<VisitorCheckoutPage />}
          />

          <Route
            path="/admin/visitors/:id/pass"
            element={<VisitorPassPage />}
          />

          <Route
            path="/admin/departments"
            element={<DepartmentManagementPage />}
          />

          <Route
            path="/admin/users"
            element={<UserManagementPage />}
          />

          <Route
            path="/admin/users/create"
            element={<CreateUserPage />}
          />
        </Route>
      </Route>

      {/* GATE EMPLOYEE */}
      <Route
        element={
          <ProtectedRoute
            allowedRoles={["GATE_EMPLOYEE"]}
          />
        }
      >
        <Route element={<AppLayout />}>
          <Route
            path="/gate"
            element={
              <DashboardPage role="GATE_EMPLOYEE" />
            }
          />

          <Route
            path="/gate/visitors"
            element={<VisitorListPage />}
          />

          <Route
            path="/gate/visitors/register"
            element={<VisitorRegistrationPage />}
          />

          <Route
            path="/gate/visitors/check-out"
            element={<VisitorCheckoutPage />}
          />

          <Route
            path="/gate/visitors/:id/pass"
            element={<VisitorPassPage />}
          />
        </Route>
      </Route>

      {/* EMPLOYEE */}
      <Route
        element={
          <ProtectedRoute
            allowedRoles={["EMPLOYEE"]}
          />
        }
      >
        <Route element={<AppLayout />}>
          <Route
            path="/employee"
            element={<DashboardPage role="EMPLOYEE" />}
          />

          <Route
            path="/employee/approvals"
            element={<VisitorApprovalPage />}
          />
        </Route>
        <Route
  path="/employee/history"
  element={<VisitorHistoryPage />}
/>
      </Route>

      {/* DIRECTOR */}
      <Route
        element={
          <ProtectedRoute
            allowedRoles={["DIRECTOR"]}
          />
        }
      >
        <Route element={<AppLayout />}>
          <Route
            path="/director"
            element={<DashboardPage role="DIRECTOR" />}
          />

          <Route
            path="/director/approvals"
            element={<VisitorApprovalPage />}
          />
        </Route>
        <Route
  path="/employee/history"
  element={<VisitorHistoryPage />}
/>
      </Route>

      {/* PERMISSION-BASED VISITOR REGISTRATION */}
      <Route
        element={
          !user ? (
            <Navigate to="/login" replace />
          ) : canRegisterVisitor(user) ? (
            <AppLayout />
          ) : (
            <Navigate to="/unauthorized" replace />
          )
        }
      >
        <Route
          path="/visitor/register"
          element={<VisitorRegistrationPage />}
        />
      </Route>

{/* PERMISSION-BASED VISITOR LIST */}
<Route
  element={
    !user ? (
      <Navigate to="/login" replace />
    ) : canViewVisitors(user) ? (
      <AppLayout />
    ) : (
      <Navigate to="/unauthorized" replace />
    )
  }
>
  <Route
    path="/visitor/list"
    element={<VisitorListPage />}
  />
</Route>

      {/* 404 */}
      <Route
        path="*"
        element={<NotFound />}
      />
    </Routes>
  );
};

const App = () => (
  <BrowserRouter>
    <AppRoutes />
  </BrowserRouter>
);

export default App;
