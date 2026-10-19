import { Link } from "react-router-dom";
import { buttonStyles } from "../../components/common/buttonStyles";

const NotFound = () => (
  <main className="flex min-h-screen items-center justify-center bg-canvas p-4">
    <section className="rise w-full max-w-sm rounded-card border border-line bg-white p-8 text-center shadow-card">
      <p className="text-5xl font-semibold tracking-tight text-brand/90">404</p>
      <h1 className="mt-3 text-base font-semibold text-ink">Page not found</h1>
      <p className="mt-1 text-[13px] text-slate-500">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className={`${buttonStyles("primary", "md")} mt-5`}>
        Back to dashboard
      </Link>
    </section>
  </main>
);

export default NotFound;
