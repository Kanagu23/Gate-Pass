
const Button = ({
  children,
  variant = "primary",
  type = "button",
  disabled = false,
  loading = false,
  onClick,
  className = "",
}) => {
  const base =
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-[7px] px-4 py-2 text-sm font-medium transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50";

  const variants = {
    primary:
      "bg-[#4169e8] text-white hover:bg-[#3157d5] active:translate-y-px",
    secondary:
      "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300",
    danger:
      "bg-red-600 text-white hover:bg-red-700 active:translate-y-px",
    ghost:
      "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${base} ${variants[variant] || variants.primary} ${className}`}
    >
      {loading ? "Please wait..." : children}
    </button>
  );
};

export default Button;
