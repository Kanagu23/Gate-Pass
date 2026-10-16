
const Input = ({
  label,
  id,
  error,
  hint,
  rightElement,
  className = "",
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          {label}
          {props.required && (
            <span className="ml-1 text-red-600">*</span>
          )}
        </label>
      )}

      <div className="relative">
        <input
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error ? `${id}-error` : hint ? `${id}-hint` : undefined
          }
          className={`h-11 w-full rounded-[7px] border bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 ${
            error ? "border-red-400" : "border-slate-300"
          } ${rightElement ? "pr-11" : ""} ${className}`}
          {...props}
        />

        {rightElement && (
          <div className="absolute inset-y-0 right-0 flex items-center">
            {rightElement}
          </div>
        )}
      </div>

      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      )}

      {!error && hint && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-slate-500">
          {hint}
        </p>
      )}
    </div>
  );
};

export default Input;
