import { Inbox } from "lucide-react";

const EmptyState = ({ icon: Icon = Inbox, title, description }) => (
  <div className="flex flex-col items-center px-6 py-14 text-center">
    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
      <Icon size={18} />
    </div>
    <p className="text-[13px] font-semibold text-slate-700">{title}</p>
    {description && (
      <p className="mt-1 max-w-xs text-xs text-slate-500">{description}</p>
    )}
  </div>
);

export default EmptyState;
