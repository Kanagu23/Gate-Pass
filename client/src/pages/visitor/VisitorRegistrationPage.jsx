
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

import {
  registerVisitor,
  searchVisitingEmployee,
} from "../../api/visitor.api";
import { useAuth } from "../../context/AuthContext";
const initialForm = {
  name: "",
  mobile: "",
  email: "",
  address: "",
  organization: "",
  idProofNo: "",
  profilePhoto: "",
  visitingPurpose: "",
  remarks: "",
  validationHours: 24,
};

const InputField = ({
  label,
  required = false,
  ...props
}) => (
  <label className="block space-y-2">
    <span className="text-sm font-medium text-slate-700">
      {label}
      {required && <span className="ml-1 text-red-500">*</span>}
    </span>

    <input
      required={required}
      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#4169e8] focus:ring-2 focus:ring-blue-100"
      {...props}
    />
  </label>
);

const VisitorRegistrationPage = () => {
  const [form, setForm] = useState(initialForm);
  const [employeeId, setEmployeeId] = useState("");
  const [employee, setEmployee] = useState(null);

  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [searchError, setSearchError] = useState("");
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState(null);
  const { user } = useAuth();

const dashboardPath =
  user?.role === "ADMIN" ? "/admin" : "/gate";

  const updateField = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleEmployeeSearch = async () => {
    if (!/^EMP\d+$/i.test(employeeId.trim())) {
      setEmployee(null);
      setSearchError("Enter a valid Employee ID, e.g. EMP0001.");
      return;
    }

    try {
      setSearching(true);
      setSearchError("");
      setEmployee(null);

      const response = await searchVisitingEmployee(
        employeeId.trim().toUpperCase()
      );

      setEmployee(response.employee);
    } catch (error) {
      setSearchError(
        error.response?.data?.message ||
          "Unable to find employee."
      );
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!employee) {
      setFormError("Please search and select a visiting employee.");
      return;
    }

    try {
      setSubmitting(true);
      setFormError("");
      setSuccess(null);

      const response = await registerVisitor({
        ...form,
        name: form.name.trim(),
        mobile: form.mobile.trim(),
        visitingEmployee: employee.id,
        validationHours: Number(form.validationHours),
      });

      setSuccess(response.visitor);
      setForm(initialForm);
      setEmployeeId("");
      setEmployee(null);
    } catch (error) {
      setFormError(
        error.response?.data?.message ||
          "Visitor registration failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
<Link
  to={dashboardPath}
  className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-[#4169e8]"
>
  <ArrowLeft size={17} />
  Back to Dashboard
</Link>

      <div className="border-b border-slate-200 pb-5">
        <div className="mb-2 flex items-center gap-2 text-[#4169e8]">
          <UserPlus size={19} />
          <span className="text-xs font-semibold uppercase tracking-wider">
            Visitor Management
          </span>
        </div>

        <h1 className="text-2xl font-semibold text-[#10132e]">
          Register Visitor
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Register a visitor and send the request to the
          visiting employee for approval.
        </p>
      </div>

      {success && (
        <div
          role="status"
          className="rounded-md border border-green-200 bg-green-50 p-4"
        >
          <div className="flex items-center gap-2 font-semibold text-green-800">
            <CheckCircle2 size={19} />
            Visitor registered successfully
          </div>

          <p className="mt-2 text-sm text-green-700">
            Visitor ID: {success.visitorId}
          </p>

          <p className="mt-1 text-sm text-green-700">
            Status: {success.status}. Waiting for employee approval.
          </p>
        </div>
      )}

      {formError && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle size={18} />
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-base font-semibold text-[#10132e]">
            Visitor Information
          </h2>

          <div className="grid gap-5 md:grid-cols-2">
            <InputField
              label="Full Name"
              name="name"
              value={form.name}
              onChange={updateField}
              required
            />

            <InputField
              label="Mobile Number"
              name="mobile"
              type="tel"
              value={form.mobile}
              onChange={updateField}
              required
            />

            <InputField
              label="Email Address"
              name="email"
              type="email"
              value={form.email}
              onChange={updateField}
            />

            <InputField
              label="Organization"
              name="organization"
              value={form.organization}
              onChange={updateField}
            />

            <InputField
              label="ID Proof Number"
              name="idProofNo"
              value={form.idProofNo}
              onChange={updateField}
            />

            <InputField
              label="Address"
              name="address"
              value={form.address}
              onChange={updateField}
            />

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">
                Visiting Purpose
                <span className="ml-1 text-red-500">*</span>
              </span>

              <select
                name="visitingPurpose"
                value={form.visitingPurpose}
                onChange={updateField}
                required
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#4169e8]"
              >
                <option value="">Select Purpose</option>
                <option value="Audit">Audit</option>
                <option value="Relative">Relative</option>
                <option value="Suppliers">Suppliers</option>
                <option value="Others">Others</option>
              </select>
            </label>

            <InputField
              label="Validation Hours"
              name="validationHours"
              type="number"
              min="1"
              max="168"
              value={form.validationHours}
              onChange={updateField}
              required
            />
          </div>

          <label className="mt-5 block space-y-2">
            <span className="text-sm font-medium text-slate-700">
              Remarks
            </span>

            <textarea
              name="remarks"
              rows={3}
              value={form.remarks}
              onChange={updateField}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#4169e8]"
            />
          </label>
        </section>

        <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-base font-semibold text-[#10132e]">
            Visiting Employee / Director
          </h2>

          <p className="mb-5 text-sm text-slate-500">
            Search using Employee ID to retrieve employee details.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={employeeId}
              onChange={(event) => {
                setEmployeeId(event.target.value);
                setEmployee(null);
                setSearchError("");
              }}
              placeholder="Enter Employee ID (EMP0001)"
              className="min-h-11 flex-1 rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-[#4169e8]"
            />

            <button
              type="button"
              onClick={handleEmployeeSearch}
              disabled={searching}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#10132e] px-5 text-sm font-medium text-white disabled:opacity-60"
            >
              {searching ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <Search size={17} />
              )}
              Search Employee
            </button>
          </div>

          {searchError && (
            <p role="alert" className="mt-3 text-sm text-red-600">
              {searchError}
            </p>
          )}

          {employee && (
            <div className="mt-5 rounded-md border border-blue-200 bg-blue-50/50 p-5">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#10132e]">
                <CheckCircle2 size={18} className="text-green-600" />
                Employee Selected
              </div>

              <div className="grid gap-4 text-sm md:grid-cols-2">
                <Detail label="Name" value={employee.name} />
                <Detail label="Employee ID" value={employee.employeeId} />
                <Detail label="Department" value={employee.department} />
                <Detail label="Role" value={employee.role} />
                <Detail label="Phone" value={employee.phone} />
                <Detail label="Email" value={employee.email} />
              </div>
            </div>
          )}
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting || searching || !employee}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#4169e8] px-6 text-sm font-semibold text-white transition hover:bg-[#3455c4] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <UserPlus size={17} />
            )}
            {submitting ? "Registering..." : "Register Visitor"}
          </button>
        </div>
      </form>
    </div>
  );
};

const Detail = ({ label, value }) => (
  <div>
    <p className="mb-1 text-xs text-slate-500">{label}</p>
    <p className="font-medium text-slate-800">{value || "—"}</p>
  </div>
);

export default VisitorRegistrationPage;
