const Input = ({
  label,
  id,
  error,
  hint,
  rightElement,
  className = "",
  ...props
}) => (
  <div className="w-full">
    {label && (
      <label
        htmlFor={id}
        className="mb-1 block text-xs font-medium text-slate-600"
      >
        {label}
        {props.required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
    )}

    <div className="relative">
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={
          error ? `${id}-error` : hint ? `${id}-hint` : undefined
        }
        className={`field ${rightElement ? "pr-10" : ""} ${className}`}
        {...props}
      />

      {rightElement && (
        <div className="absolute inset-y-0 right-0 flex items-center">
          {rightElement}
        </div>
      )}
    </div>

    {error && (
      <p id={`${id}-error`} role="alert" className="mt-1 text-xs text-red-600">
        {error}
      </p>
    )}
    {!error && hint && (
      <p id={`${id}-hint`} className="mt-1 text-xs text-slate-500">
        {hint}
      </p>
    )}
  </div>
);

export default Input;
