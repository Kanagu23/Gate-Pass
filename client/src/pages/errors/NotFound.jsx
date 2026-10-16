
import { Link } from "react-router-dom";
import Button from "../../components/common/Button";

const NotFound = () => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#eef0f5] p-4">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold tracking-widest text-[#4169e8]">
          ERROR 404
        </p>

        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
          Page not found
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          The page you're looking for doesn't exist or may have
          been moved.
        </p>

        <Link to="/" className="mt-6 inline-flex">
          <Button>Return to dashboard</Button>
        </Link>
      </section>
    </main>
  );
};

export default NotFound;
