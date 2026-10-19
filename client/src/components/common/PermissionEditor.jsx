
const PERMISSION_GROUPS = [
  {
    title: "Visitors",
    items: [
      ["visitor.register", "Register visitors"],
      ["visitor.view", "View visitors"],
      ["visitor.approve", "Approve visitors"],
      ["visitor.checkout", "Check out visitors"],
    ],
  },
  {
    title: "Users",
    items: [
      ["user.view", "View users"],
      ["user.create", "Create users"],
      ["user.manage", "Manage users"],
    ],
  },
  {
    title: "Departments",
    items: [
      ["department.view", "View departments"],
      ["department.manage", "Manage departments"],
    ],
  },
  {
    title: "Reports",
    items: [
      ["report.view", "View reports"],
      ["report.export", "Export reports"],
    ],
  },
];

const PermissionEditor = ({
  value = [],
  onChange,
  disabled = false,
}) => {
  const togglePermission = (permission) => {
    if (disabled) return;

    const next = value.includes(permission)
      ? value.filter((item) => item !== permission)
      : [...value, permission];

    onChange(next);
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {PERMISSION_GROUPS.map((group) => (
        <div
          key={group.title}
          className="rounded-card border border-line p-3"
        >
          <h3 className="mb-3 text-xs font-semibold text-ink">
            {group.title}
          </h3>

          <div className="space-y-2.5">
            {group.items.map(([permission, label]) => (
              <label
                key={permission}
                className="flex cursor-pointer items-center gap-2.5 text-xs text-slate-700"
              >
                <input
                  type="checkbox"
                  checked={value.includes(permission)}
                  onChange={() => togglePermission(permission)}
                  disabled={disabled}
                  className="h-4 w-4 accent-brand"
                />

                {label}
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PermissionEditor;
