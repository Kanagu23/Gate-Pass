import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";

const Login=()=> {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const  handleSubmit=async(event) =>{
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const user = await login({ identifier, password });

      const requestedPath = location.state?.from?.pathname;

      const roleHome = {
        ADMIN: "/admin",
        GATE_EMPLOYEE: "/gate",
        EMPLOYEE: "/employee",
        DIRECTOR: "/director",
      };

      navigate(requestedPath || roleHome[user.role] || "/", {
        replace: true,
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Login failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-5 rounded-2xl bg-white p-8 shadow-lg"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Gate Pass Login
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Sign in to manage visitor access.
          </p>
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        <div>
          <label
            htmlFor="identifier"
            className="mb-1 block text-sm font-medium"
          >
            Email or Employee ID
          </label>
          <input
            id="identifier"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            autoComplete="username"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-600"
            placeholder="Enter email or employee ID"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-sm font-medium"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-600"
            placeholder="Enter password"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-blue-700 px-4 py-2.5 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
export default Login