
import { ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../../components/common/Button";

const Unauthorized = () => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#eef0f5] p-4">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-red-50 text-red-600">
          <ShieldAlert size={26} />
        </div>

        <h1 className="mt-5 text-xl font-semibold text-slate-900">
          Access denied
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Your account does not have permission to view this page.
          Contact your administrator if you need access.
        </p>

        <Link to="/" className="mt-6 inline-flex">
          <Button>Return to dashboard</Button>
        </Link>
      </section>
    </main>
  );
};

export default Unauthorized;
