import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({allowedRoles}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-600">Checking your session...</p>
      </div>
    );
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute