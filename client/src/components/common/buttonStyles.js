const base =
  "inline-flex shrink-0 select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-control font-medium transition-[background-color,border-color,color,transform,box-shadow] duration-150 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50";

const variants = {
  primary:
    "bg-brand text-white shadow-[0_1px_0_rgba(255,255,255,0.14)_inset,0_1px_2px_rgba(65,105,232,0.35)] hover:bg-brand-hover",
  secondary:
    "border border-line-strong bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  danger: "bg-red-600 text-white hover:bg-red-700",
  success: "bg-emerald-600 text-white hover:bg-emerald-700",
  "danger-outline":
    "border border-red-200 bg-white text-red-600 hover:bg-red-50",
  soft: "bg-brand-soft text-brand hover:bg-[#e2e9ff]",
};

const sizes = {
  sm: "h-7 px-2.5 text-xs",
  md: "h-9 px-3.5 text-[13px]",
  lg: "h-10 px-4 text-sm",
};

export const buttonStyles = (variant = "primary", size = "md") =>
  `${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md}`;
