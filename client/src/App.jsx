import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { useAuth } from "./context/AuthContext";
import { roleHome } from "./config/navigation";
import PageLoader from "./components/common/PageLoader";
import ProtectedRoute from "./routes/ProtectedRoute";
import HomeRedirect from "./routes/HomeRedirect";
import VisitorPassPage from "./pages/visitor/VisitorPassPage";
import Login from "./pages/auth/login";
import DashboardPage from "./pages/dashboard/DashboardPage";
import AppLayout from "./layouts/AppLayout";
import Unauthorized from "./pages/errors/Unauthorized";
import NotFound from "./pages/errors/NotFound";
import VisitorRegistrationPage from "./pages/visitor/VisitorRegistrationPage";
import VisitorApprovalPage from "./pages/visitor/VisitorApprovalPage";
import VisitorListPage from "./pages/visitor/VisitorListPage";
import VisitorCheckoutPage from "./pages/visitor/VisitorCheckoutPage";
import CreateUserPage from "./pages/admin/CreateUserPage";
import DepartmentManagementPage from "./pages/admin/DepartmentManagementPage";
const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader label="Checking your session..." />;

  return (
    <Routes>
      <Route path="/" element={<HomeRedirect roleHome={roleHome} />} />

      <Route
        path="/login"
        element={
          user ? (
            <Navigate to={roleHome[user.role] || "/unauthorized"} replace />
          ) : (
            <Login />
          )
        }
      />

      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
        <Route element={<AppLayout />}>
          <Route path="/admin" element={<DashboardPage role="ADMIN" />} />
          <Route
            path="/admin/visitors/:id/pass"
            element={<VisitorPassPage />}
          />
          <Route
            path="/admin/visitors/register"
            element={<VisitorRegistrationPage />}
          />
          <Route path="/admin/visitors" element={<VisitorListPage />} />
          <Route
            path="/admin/visitors/check-out"
            element={<VisitorCheckoutPage />}
          />
          <Route
            path="/admin/departments"
            element={<DepartmentManagementPage />}
          />
          <Route path="/admin/users/create" element={<CreateUserPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["GATE_EMPLOYEE"]} />}>
        <Route element={<AppLayout />}>
          <Route
            path="/gate"
            element={<DashboardPage role="GATE_EMPLOYEE" />}
          />
          <Route path="/gate/visitors/:id/pass" element={<VisitorPassPage />} />
          <Route
            path="/gate/visitors/register"
            element={<VisitorRegistrationPage />}
          />
          <Route path="/gate/visitors" element={<VisitorListPage />} />
          <Route
            path="/gate/visitors/check-out"
            element={<VisitorCheckoutPage />}
          />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["EMPLOYEE"]} />}>
        <Route element={<AppLayout />}>
          <Route path="/employee" element={<DashboardPage role="EMPLOYEE" />} />
          <Route path="/employee/approvals" element={<VisitorApprovalPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["DIRECTOR"]} />}>
        <Route element={<AppLayout />}>
          <Route path="/director" element={<DashboardPage role="DIRECTOR" />} />
          <Route path="/director/approvals" element={<VisitorApprovalPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;
