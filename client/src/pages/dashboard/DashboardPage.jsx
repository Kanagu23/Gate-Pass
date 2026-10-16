
import { LayoutDashboard, ShieldCheck } from "lucide-react";
import Card from "../../components/common/Card";

const roleLabels = {
  ADMIN: "Administrator",
  GATE_EMPLOYEE: "Gate Employee",
  EMPLOYEE: "Employee",
  DIRECTOR: "Director",
};

const DashboardPage = ({ role }) => {
  const roleLabel = roleLabels[role] || "User";

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#4169e8]">
            <LayoutDashboard size={22} />
          </div>

          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">
              {roleLabel} Dashboard
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Your Gate Pass workspace.
            </p>
          </div>
        </div>
      </section>

      <Card
        title="Welcome to Gate Pass"
        description="Your workspace is ready."
      >
        <div className="flex items-start gap-3">
          <ShieldCheck
            size={20}
            className="mt-0.5 shrink-0 text-[#4169e8]"
          />

          <div>
            <p className="text-sm font-medium text-slate-800">
              Signed in as {roleLabel}
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Visitor management features will be connected to the
              existing backend in the next implementation steps.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DashboardPage;
