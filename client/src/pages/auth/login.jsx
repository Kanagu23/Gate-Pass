import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, QrCode, ShieldCheck, UserCheck } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { roleHome } from "../../config/navigation";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Alert from "../../components/common/Alert";

const highlights = [
  { icon: UserCheck, text: "Role-based visitor approvals" },
  { icon: QrCode, text: "QR passes with one-scan check-out" },
  { icon: ShieldCheck, text: "A clear record of every entry and exit" },
];

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

      navigate(requestedPath || roleHome[user.role] || "/unauthorized", {
        replace: true,
      });
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
    <main className="flex min-h-screen items-center justify-center bg-canvas p-4">
      <div className="rise grid w-full max-w-[880px] overflow-hidden rounded-xl border border-line bg-white shadow-[0_20px_60px_-20px_rgba(16,19,46,0.18)] md:min-h-[500px] md:grid-cols-[1.05fr_1fr]">
        {/* Brand panel */}
<section className="relative hidden flex-col justify-between overflow-hidden bg-[#10132e] p-8 text-white md:flex">          {/* Subtle dot grid + one soft glow */}
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "radial-gradient(circle, #fff 1px, transparent 1px)",
              backgroundSize: "18px 18px",
            }}
          />
          <div
            aria-hidden="true"
            className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-brand/45 blur-[80px]"
          />

          <div className="relative flex items-center gap-2.5">
            <img
              src="/khgroup-logo.png"
              alt="KHGROUP"
            className="h-8 w-auto rounded !bg-white p-1 object-contain"
            />
            <span className="text-sm font-semibold tracking-tight">
              Gate Pass
            </span>
          </div>

          <div className="relative">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-300">
              Visitor Management
            </p>
            <h1 className="text-[28px] font-semibold leading-[1.15] tracking-tight">
              Secure your workplace.
              <br />
              Simplify every visit.
            </h1>

            <ul className="mt-6 space-y-2.5">
              {highlights.map(({ icon: Icon, text }, i) => (
                <li
                  key={text}
                  style={{ "--i": i + 3 }}
                  className="rise flex items-center gap-2.5 text-[13px] text-slate-300"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white/10 text-blue-200">
                    <Icon size={13} />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <p className="relative text-[11px] text-slate-500">
            © {new Date().getFullYear()} KHGROUP
          </p>
        </section>

        {/* Form panel */}
        <section className="flex items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-[320px]">
            <div className="mb-7 flex items-center gap-2.5 md:hidden">
              <img
                src="/khgroup-logo.png"
                alt="KHGROUP"
                className="h-8 w-auto object-contain"
              />
              <span className="text-sm font-semibold text-ink">Gate Pass</span>
            </div>

            <h2 className="text-xl font-semibold tracking-tight text-ink">
              Welcome back
            </h2>
            <p className="mt-1 text-[13px] text-slate-500">
              Sign in to your Gate Pass workspace.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-3.5">
              {error && <Alert tone="error">{error}</Alert>}

              <Input
                id="identifier"
                name="identifier"
                label="Work email or Employee ID"
                type="text"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                placeholder="you@company.com or EMP0001"
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
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    className="flex h-full w-9 items-center justify-center rounded-r-control text-slate-400 transition-colors hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                }
              />

              <Button
                type="submit"
                size="lg"
                disabled={!identifier.trim() || !password}
                loading={submitting}
                loadingText="Signing in..."
                className="group w-full"
              >
                Sign in
                <ArrowRight
                  size={15}
                  className="transition-transform duration-150 group-hover:translate-x-0.5"
                />
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-slate-400">
              Need access? Contact your system administrator.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Login;
