import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";

import { createUser } from "../../api/users.api";
import Alert from "../../components/common/Alert";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import PageHeader from "../../components/common/PageHeader";
import Select from "../../components/common/Select";
import { getDepartments } from "../../api/department.api";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  department: "",
  role: "GATE_EMPLOYEE",
  password: "",
};

const roleOptions = [
  { value: "GATE_EMPLOYEE", label: "Gate Employee" },
  { value: "EMPLOYEE", label: "Employee" },
  { value: "DIRECTOR", label: "Director" },
];

const CreateUserPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [createdUser, setCreatedUser] = useState(null);

  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setError("");
    setCreatedUser(null);

    try {
      const response = await createUser(form);

      setCreatedUser(response.user);
      setForm(initialForm);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create user account.");
    } finally {
      setSaving(false);
    }
  };
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const response = await getDepartments();

        setDepartments(
          response.departments.filter((department) => department.isActive),
        );
      } catch (error) {
        setError("Unable to load departments.");
      } finally {
        setLoadingDepartments(false);
      }
    };

    loadDepartments();
  }, []);

  const departmentOptions = [
    { value: "", label: "Select department" },
    ...departments.map((department) => ({
      value: department.code,
      label: department.name,
    })),
  ];
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <PageHeader
        backTo="/admin/users"
        backLabel="Users"
        title="New user"
        description="Create an internal Gate Pass account."
      />

      {error && <Alert tone="error">{error}</Alert>}

      {createdUser && (
        <Alert tone="success">
          Account created successfully. Employee ID: {createdUser.employeeId}
        </Alert>
      )}

      <Card
        title="Account information"
        description="Employee ID is generated automatically."
        icon={UserPlus}
      >
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Full name"
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            required
          />

          <Input
            label="Email address"
            type="email"
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
            required
          />

          <Input
            label="Phone number"
            value={form.phone}
            onChange={(event) => updateField("phone", event.target.value)}
          />

          <Select
            label="Department"
            value={form.department}
            onChange={(event) => updateField("department", event.target.value)}
            disabled={loadingDepartments || departments.length === 0}
            required
          >
            <option value="">
              {loadingDepartments
                ? "Loading departments..."
                : departments.length === 0
                  ? "No active departments available"
                  : "Select department"}
            </option>

            {departments.map((department) => (
              <option key={department._id} value={department.code}>
                {department.name}
              </option>
            ))}
          </Select>

          <Select
            label="Role"
            value={form.role}
            onChange={(event) => updateField("role", event.target.value)}
            required
          >
            {roleOptions.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </Select>

          <Input
            label="Initial password"
            type="password"
            value={form.password}
            onChange={(event) => updateField("password", event.target.value)}
            minLength={12}
            maxLength={72}
            required
          />

          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/admin")}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={saving}>
              <UserPlus size={14} />
              {saving ? "Creating..." : "Create user"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateUserPage;
