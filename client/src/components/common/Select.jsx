const Select = ({ label, id, children, className = "", ...props }) => (
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
    <select id={id} className={`field ${className}`} {...props}>
      {children}
    </select>
  </div>
);

export default Select;
