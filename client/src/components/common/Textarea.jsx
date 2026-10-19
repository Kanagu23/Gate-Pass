const Textarea = ({ label, id, className = "", ...props }) => (
  <div className="w-full">
    {label && (
      <label
        htmlFor={id}
        className="mb-1 block text-xs font-medium text-slate-600"
      >
        {label}
      </label>
    )}
    <textarea id={id} className={`field ${className}`} {...props} />
  </div>
);

export default Textarea;
