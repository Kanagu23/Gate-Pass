import { ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { buttonStyles } from "../../components/common/buttonStyles";

const Unauthorized = () => (
  <main className="flex min-h-screen items-center justify-center bg-canvas p-4">
    <section className="rise w-full max-w-sm rounded-card border border-line bg-white p-8 text-center shadow-card">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-500">
        <ShieldAlert size={19} />
      </div>
      <h1 className="mt-3 text-base font-semibold text-ink">Access denied</h1>
      <p className="mt-1 text-[13px] text-slate-500">
        Your account doesn't have permission to view this page. Contact your
        administrator if you need access.
      </p>
      <Link to="/" className={`${buttonStyles("primary", "md")} mt-5`}>
        Back to dashboard
      </Link>
    </section>
  </main>
);

export default Unauthorized;
