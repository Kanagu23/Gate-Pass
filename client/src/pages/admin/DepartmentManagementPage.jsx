
import { useCallback, useEffect, useState } from "react";
import {
  Building2,
  Plus,
  RefreshCw,
  UserRoundCog,
} from "lucide-react";

import {
  createDepartment,
  getDepartments,
  assignDepartmentHead,
} from "../../api/department.api";  

import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import PageHeader from "../../components/common/PageHeader";
import EmployeeSearch from "../../components/common/EmployeeSearch";
import { DIVISIONS } from "../../config/divisions";
import { useAuth } from "../../context/AuthContext";

const initialForm = {
  code: "",
  name: "",
  description: "",
  division: "",
};

const DepartmentManagementPage = () => {
    const [selectedDepartment, setSelectedDepartment] = useState(null);
const [selectedEmployee, setSelectedEmployee] = useState(null);
const [assigningHead, setAssigningHead] = useState(false);
const [headError, setHeadError] = useState("");
  const { user } = useAuth();
  const globalAccess = user?.role === "SYSTEM_ADMIN" || (user?.role === "ADMIN" && !user?.division);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadDepartments = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getDepartments();
      setDepartments(response.departments || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load departments."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

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
    setSuccess("");

    try {
      await createDepartment({ ...form, division: globalAccess ? form.division : user?.division });

      setSuccess("Department created successfully.");
      setForm(initialForm);
      await loadDepartments();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to create department."
      );
    } finally {
      setSaving(false);
    }
  };

const handleAssignHead = async (event) => {
  event.preventDefault();

  if (!selectedDepartment || assigningHead) return;

  setAssigningHead(true);
  setError("");
  setSuccess("");

 
try {
  if (!selectedEmployee?.employeeId) {
    setHeadError("Please select an employee.");
    return;
  }

  await assignDepartmentHead(
    selectedDepartment._id,
    selectedEmployee.employeeId
  );

  setSuccess("Department Head assigned successfully.");
  setSelectedDepartment(null);
  setSelectedEmployee(null);

  await loadDepartments();
} catch (err) {
  setHeadError(
    err.response?.data?.message ||
      "Unable to assign Department Head."
  );
} finally {
  setAssigningHead(false);
}

};

  return (
    <div className="space-y-5">
      <PageHeader
        title="Departments"
        description="Organise the teams visitors can be routed to."
      />

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      {success && (
        <p role="status" className="text-sm text-emerald-600">
          {success}
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_1.5fr]">
        <Card>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Plus size={17} className="text-brand" />
              <h2 className="font-semibold text-ink">
                Add Department
              </h2>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <label className="block text-xs font-medium text-slate-600">Division
                <select className="field mt-1" value={globalAccess ? form.division : user?.division || ""} disabled={!globalAccess} onChange={(e) => updateField("division", e.target.value)} required>
                  <option value="">Select division</option>
                  {DIVISIONS.map((d) => <option key={d.code} value={d.code}>{d.name}</option>)}
                </select>
              </label>
              <Input
                label="Department Code"
                value={form.code}
                onChange={(event) =>
                  updateField(
                    "code",
                    event.target.value.toUpperCase()
                  )
                }
                placeholder="e.g. FWD I"
                required
              />

              <Input
                label="Department Name"
                value={form.name}
                onChange={(event) =>
                  updateField("name", event.target.value)
                }
                placeholder="e.g. Foot Wear Department 1"
                required
              />

              <div>
                <label
                  htmlFor="department-description"
                  className="mb-1 block text-xs font-medium text-slate-600"
                >
                  Description
                </label>

                <textarea
                  id="department-description"
                  className="field min-h-24 w-full"
                  value={form.description}
                  onChange={(event) =>
                    updateField(
                      "description",
                      event.target.value
                    )
                  }
                />
              </div>

              <Button type="submit" disabled={saving}>
                <Plus size={15} />
                {saving ? "Creating..." : "Add Department"}
              </Button>
            </form>
          </div>
        </Card>

        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Building2
                  size={18}
                  className="text-brand"
                />
                <h2 className="font-semibold text-ink">
                  Departments ({departments.length})
                </h2>
              </div>

              <Button
                type="button"
                variant="secondary"
                onClick={loadDepartments}
                disabled={loading}
              >
                <RefreshCw size={15} />
                Refresh
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="tbl w-full">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Department</th>
                    <th>Head</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5}>
                        Loading departments...
                      </td>
                    </tr>
                  ) : departments.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        No departments found.
                      </td>
                    </tr>
                  ) : (
                    departments.map((department) => (
                      <tr key={department._id}>
                        <td className="font-medium">
                          {department.code}
                        </td>

                        <td>{department.name}</td>

                        <td>
                          {department.head?.name ||
                            "Not assigned"}
                        </td>

                        <td>
                          <span
                            className={
                              department.isActive
                                ? "text-emerald-600"
                                : "text-slate-500"
                            }
                          >
                            {department.isActive
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>
                        <td>
  <Button
    type="button"
    variant="secondary"
    disabled={!department.isActive}
    onClick={() => {
  setSelectedDepartment(department);
  setSelectedEmployee(null);
  setError("");
  setSuccess("");
}}
  >
    <UserRoundCog size={14} />
    {department.head ? "Change Head" : "Assign Head"}
  </Button>
</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
        
{selectedDepartment && (
  <Card>
    <div className="space-y-4">
      <div>
        <h2 className="font-semibold text-ink">
          Assign Department Head
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Department: {selectedDepartment.name}
        </p>
      </div>

      <form
        onSubmit={handleAssignHead}
        className="space-y-4"
      >
        <div className="max-w-sm">
         <EmployeeSearch
  label="Search Department Head"
  department={selectedDepartment.code}
  role="DEPARTMENT_HEAD"
  value={selectedEmployee}
  onChange={setSelectedEmployee}
/>
        </div>

        {headError && <p role="alert" className="text-xs text-red-600">{headError}</p>}
        <p className="text-xs text-slate-500">
          Select an active Employee or Director
          belonging to this department.
        </p>

        <div className="flex flex-wrap gap-2">
          <Button
            type="submit"
            disabled={assigningHead}
          >
            {assigningHead
              ? "Assigning..."
              : "Save Department Head"}
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={() => {
  setSelectedDepartment(null);
  setSelectedEmployee(null);
}}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  </Card>
)}

      </div>
    </div>
  );
};

export default DepartmentManagementPage;
