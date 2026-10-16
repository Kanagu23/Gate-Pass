
const Card = ({
  children,
  title,
  description,
  action,
  className = "",
}) => {
  return (
    <section
      className={`rounded-[10px] border border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)] ${className}`}
    >
      {(title || description || action) && (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            {title && (
              <h2 className="text-base font-semibold text-slate-900">
                {title}
              </h2>
            )}

            {description && (
              <p className="mt-1 text-sm text-slate-500">
                {description}
              </p>
            )}
          </div>

          {action}
        </header>
      )}

      <div className="p-5">{children}</div>
    </section>
  );
};

export default Card;
