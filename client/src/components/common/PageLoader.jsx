import Spinner from "./Spinner";

const PageLoader = ({ label = "Loading..." }) => (
  <div className="flex min-h-screen items-center justify-center bg-canvas">
    <div className="animate-fade flex items-center gap-2 text-[13px] text-slate-500">
      <Spinner size={16} className="text-brand" />
      {label}
    </div>
  </div>
);

export default PageLoader;
