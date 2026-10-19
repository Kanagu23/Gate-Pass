
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Users } from "lucide-react";

import { getUsers ,updateUserStatus} from "../../api/users.api";
import Alert from "../../components/common/Alert";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import PageHeader from "../../components/common/PageHeader";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";
import ConfirmDialog from "../../components/common/ConfirmDialog";

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [department, setDepartment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
const [pending, setPending] = useState(null);
const [updatingId, setUpdatingId] = useState(null);
const [successMessage, setSuccessMessage] = useState("");
  useEffect(() => {
    let active = true;

    const loadUsers = async () => {
      try {
        const response = await getUsers();

        if (active) {
          setUsers(response.users || []);
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Unable to load users."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadUsers();

    return () => {
      active = false;
    };
  }, []);

  const departments = useMemo(
    () =>
      [...new Set(users.map((user) => user.department).filter(Boolean))]
        .sort(),
    [users]
  );


const handleStatusChange = (user) => {
  setPending(user);
};

const confirmStatusChange = async () => {
  if (!pending || updatingId) return;

  const user = pending;
  const nextStatus = !user.isActive;

  try {
    setUpdatingId(user._id);
    setError("");
    setSuccessMessage("");

    const response = await updateUserStatus(
      user._id,
      nextStatus
    );

    setUsers((previous) =>
      previous.map((item) =>
        item._id === user._id
          ? {
              ...item,
              isActive: response.user.isActive,
            }
          : item
      )
    );

    setSuccessMessage(response.message);
    setPending(null);
  } catch (error) {
    setError(
      error.response?.data?.message ||
        "Unable to update user status."
    );
  } finally {
    setUpdatingId(null);
  }
};


  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !term ||
        [
          user.name,
          user.employeeId,
          user.email,
          user.department,
        ].some((value) =>
          String(value || "").toLowerCase().includes(term)
        );

      return (
        matchesSearch &&
        (!role || user.role === role) &&
        (!department || user.department === department)
      );
    });
  }, [users, search, role, department]);

  return (
    <div className="space-y-4">
      <PageHeader
        backTo="/admin"
        backLabel="Dashboard"
        title="User management"
        description="View and manage internal Gate Pass accounts."
      />

      {error && (
        <Alert tone="error" onDismiss={() => setError("")}>
          {error}
        </Alert>
      )}
      {successMessage && (
  <Alert
    tone="success"
    onDismiss={() => setSuccessMessage("")}
  >
    {successMessage}
  </Alert>
)}

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Users size={17} className="text-brand" />
            Internal users
            <span className="text-xs font-normal text-slate-500">
              ({filteredUsers.length})
            </span>
          </div>

          <Link
            to="/admin/users/create"
            className="inline-flex items-center gap-2 rounded-card bg-brand px-3 py-2 text-xs font-semibold text-white"
          >
            <Plus size={14} />
            Create user
          </Link>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="relative">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-9 text-slate-400"
            />
            <Input
              id="userSearch"
              label="Search users"
              placeholder="Name, ID or email"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-9"
            />
          </div>

          <Select
            id="roleFilter"
            label="Role"
            value={role}
            onChange={(event) => setRole(event.target.value)}
          >
            <option value="">All roles</option>
            <option value="ADMIN">Admin</option>
            <option value="GATE_EMPLOYEE">Gate Employee</option>
            <option value="EMPLOYEE">Employee</option>
            <option value="DIRECTOR">Director</option>
          </Select>

          <Select
            id="departmentFilter"
            label="Department"
            value={department}
            onChange={(event) => setDepartment(event.target.value)}
          >
            <option value="">All departments</option>
            {departments.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="tbl w-full">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4}>Loading users...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4}>No users found.</td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <p className="font-semibold text-ink">
                        {user.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {user.employeeId || "—"} · {user.email}
                      </p>
                    </td>

                    <td>{user.department || "—"}</td>

                    <td>
                      {user.role.replaceAll("_", " ")}
                    </td>

                    <td>
                      <span
                        className={
                          user.isActive
                            ? "text-xs font-medium text-emerald-700"
                            : "text-xs font-medium text-red-600"
                        }
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    
<td>
  {user.role === "ADMIN" ? (
    <span className="text-xs text-slate-400">
      Protected
    </span>
  ) : (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      loading={updatingId === user._id}
      disabled={Boolean(updatingId)}
      onClick={() => handleStatusChange(user)}
    >
      {user.isActive ? "Deactivate" : "Activate"}
    </Button>
  )}
</td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      
<ConfirmDialog
  open={Boolean(pending)}
  title={
    pending?.isActive
      ? "Deactivate user?"
      : "Activate user?"
  }
  message={
    pending
      ? `${pending.name} (${pending.employeeId || pending.email}) will be ${
          pending.isActive ? "deactivated" : "activated"
        }.`
      : ""
  }
  confirmLabel={
    pending?.isActive ? "Deactivate" : "Activate"
  }
  confirmVariant={
    pending?.isActive ? "danger" : "success"
  }
  loading={Boolean(updatingId)}
  onConfirm={confirmStatusChange}
  onCancel={() => {
    if (!updatingId) setPending(null);
  }}
/>

    </div>
  );
};

export default UserManagementPage;
