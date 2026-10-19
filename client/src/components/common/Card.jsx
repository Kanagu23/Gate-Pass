const Card = ({
  children,
  title,
  description,
  action,
  icon: Icon,
  padded = true,
  className = "",
  ...props
}) => (
  <section
    className={`rounded-card border border-line bg-white shadow-card ${className}`}
    {...props}
  >
    {(title || description || action) && (
      <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          {Icon && <Icon size={15} className="shrink-0 text-brand" />}
          <div className="min-w-0">
            {title && (
              <h2 className="truncate text-[13px] font-semibold text-ink">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-0.5 text-xs text-slate-500">{description}</p>
            )}
          </div>
        </div>
        {action}
      </header>
    )}

    {padded ? <div className="p-4">{children}</div> : children}
  </section>
);

export default Card;
