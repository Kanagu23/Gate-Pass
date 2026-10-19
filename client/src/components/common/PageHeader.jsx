import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const PageHeader = ({ title, description, actions, backTo, backLabel }) => (
  <div className="rise space-y-2">
    {backTo && (
      <Link
        to={backTo}
        className="group inline-flex items-center gap-1 text-xs font-medium text-slate-500 transition-colors hover:text-brand"
      >
        <ArrowLeft
          size={13}
          className="transition-transform duration-150 group-hover:-translate-x-0.5"
        />
        {backLabel || "Back"}
      </Link>
    )}

    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
      <div className="min-w-0">
        <h1 className="text-lg font-semibold tracking-tight text-ink">
          {title}
        </h1>
        {description && (
          <p className="mt-0.5 text-[13px] text-slate-500">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  </div>
);

export default PageHeader;
