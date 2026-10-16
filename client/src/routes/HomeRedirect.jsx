
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function HomeRedirect({ roleHome }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Navigate
      to={roleHome[user.role] || "/unauthorized"}
      replace
    />
  );
}
