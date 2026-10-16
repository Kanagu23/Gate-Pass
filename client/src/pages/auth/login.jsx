
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

const roleHome = {
  ADMIN: "/admin",
  GATE_EMPLOYEE: "/gate",
  EMPLOYEE: "/employee",
  DIRECTOR: "/director",
};

const Login = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) return;

    setError("");
    setSubmitting(true);

    try {
      const user = await login(identifier.trim(), password);

      const requestedPath = location.state?.from?.pathname;

      navigate(
        requestedPath || roleHome[user.role] || "/unauthorized",
        { replace: true }
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to sign in. Check your credentials and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#eef0f5] p-4 sm:p-6 lg:p-8">
      <div className="animate-fade-up grid w-full max-w-[1200px] overflow-hidden rounded-2xl bg-white shadow-[0_24px_80px_rgba(15,23,42,0.12)] lg:min-h-[650px] lg:grid-cols-2">
        {/* Branding panel */}
        <section className="relative flex min-h-[320px] flex-col justify-between overflow-hidden bg-[#10132e] p-7 text-white sm:p-10 lg:min-h-[650px] lg:p-11">
          {/* Ambient background effects */}
          <div
            aria-hidden="true"
            className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-blue-600/40 blur-[90px]"
          />

          <div
            aria-hidden="true"
            className="absolute -right-20 top-20 h-64 w-64 rounded-full bg-cyan-500/30 blur-[90px]"
          />

          <div
            aria-hidden="true"
            className="absolute -bottom-28 right-0 h-72 w-72 rounded-full bg-purple-600/25 blur-[90px]"
          />

          {/* Parent company logo and application name */}
          <div className="relative z-10 flex items-center gap-3">
            <img
              src="/khgroup-logo.png"
              alt="KHGROUP"
              className="h-11 w-auto rounded-md bg-white p-1.5 object-contain"
            />

            <span className="text-lg font-semibold tracking-tight">
              Gate Pass
            </span>
          </div>

          {/* Product introduction */}
          <div className="relative z-10 my-12 max-w-lg lg:my-0">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
              Visitor Management System
            </p>

            <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl xl:text-[42px]">
              Secure your workplace.
              <br />
              Simplify every visit.
            </h1>

            <p className="mt-5 max-w-md text-sm leading-7 text-slate-300 sm:text-base">
              Register visitors, manage approvals, and maintain
              a clear record of every entry and exit in one place.
            </p>
          </div>

          {/* Security footer */}
          <div className="relative z-10 border-t border-white/15 pt-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-blue-200">
                <ShieldCheck size={21} strokeWidth={1.8} />
              </div>

              <div>
                <p className="text-sm font-medium text-white">
                  Secure access management
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Access based on assigned roles
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Login panel */}
        <section className="flex items-center justify-center bg-white px-6 py-12 sm:px-12 lg:px-14 xl:px-16">
          <div className="w-full max-w-[390px]">
            {/* Mobile branding */}
            <div className="mb-9 flex items-center gap-3 lg:hidden">
              <img
                src="/khgroup-logo.png"
                alt="KHGROUP"
                className="h-10 w-auto object-contain"
              />

              <span className="text-base font-semibold text-[#10132e]">
                Gate Pass
              </span>
            </div>

            {/* Heading */}
            <div className="mb-8">
              <div className="mb-5 h-1 w-12 rounded-sm bg-[#4169e8]" />

              <h2 className="text-3xl font-semibold tracking-tight text-[#171b2b]">
                Welcome back
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Sign in to your Gate Pass workspace.
              </p>
            </div>

            {/* Login form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div
                  role="alert"
                  aria-live="polite"
                  className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {error}
                </div>
              )}

              <Input
                id="identifier"
                name="identifier"
                label="Work email or Employee ID"
                type="text"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                placeholder="you@company.com or employee ID"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                required
                disabled={submitting}
              />

              <Input
                id="password"
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                disabled={submitting}
                rightElement={
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((current) => !current)
                    }
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showPassword}
                    className="flex h-full w-11 items-center justify-center rounded-r-[7px] text-slate-400 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-blue-600"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                }
              />

              <Button
                type="submit"
                disabled={!identifier.trim() || !password}
                loading={submitting}
                className="h-11 w-full"
              >
                Sign in
                {!submitting && <ArrowRight size={17} />}
              </Button>
            </form>

            {/* Security notice */}
            <div className="mt-7 flex items-start gap-3 rounded-lg bg-[#f5f8ff] p-4">
              <ShieldCheck
                size={19}
                className="mt-0.5 shrink-0 text-[#4169e8]"
              />

              <div>
                <p className="text-sm font-medium text-[#243d70]">
                  Authorized access only
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-600">
                  Your permissions are determined by your assigned role.
                </p>
              </div>
            </div>

            <p className="mt-8 text-center text-xs text-slate-400">
              Need access? Contact your system administrator.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Login;
