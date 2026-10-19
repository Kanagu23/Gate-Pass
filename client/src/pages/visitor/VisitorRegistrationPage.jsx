import { useState } from "react";
import { CheckCircle2, Search, UserPlus } from "lucide-react";

import {
  registerVisitor,
  searchVisitingEmployee,
} from "../../api/visitor.api";
import { useAuth } from "../../context/AuthContext";
import Alert from "../../components/common/Alert";
import Avatar from "../../components/common/Avatar";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import PageHeader from "../../components/common/PageHeader";
import Select from "../../components/common/Select";
import Textarea from "../../components/common/Textarea";

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

const Detail = ({ label, value }) => (
  <div className="min-w-0">
    <p className="text-[11px] text-slate-500">{label}</p>
    <p className="truncate text-[13px] font-medium text-slate-800">
      {value || "—"}
    </p>
  </div>
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

  const dashboardPath = user?.role === "ADMIN" ? "/admin" : "/gate";

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
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
      setSearchError(error.response?.data?.message || "Unable to find employee.");
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
      window.scrollTo({ top: 0, behavior: "smooth" });
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
    <div className="mx-auto max-w-3xl space-y-4">
      <PageHeader
        backTo={dashboardPath}
        backLabel="Dashboard"
        title="Register visitor"
        description="Create a visitor request and send it to the visiting employee for approval."
      />

      {success && (
        <Alert
          tone="success"
          title="Visitor registered"
          onDismiss={() => setSuccess(null)}
        >
          ID <span className="font-mono font-semibold">{success.visitorId}</span>{" "}
          · {success.status}. Waiting for employee approval.
        </Alert>
      )}

      {formError && (
        <Alert tone="error" onDismiss={() => setFormError("")}>
          {formError}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card title="Visitor information" className="rise" style={{ "--i": 1 }}>
          <div className="grid gap-3.5 sm:grid-cols-2">
            <Input id="name" name="name" label="Full name" value={form.name} onChange={updateField} required />
            <Input id="mobile" name="mobile" label="Mobile number" type="tel" value={form.mobile} onChange={updateField} required />
            <Input id="email" name="email" label="Email address" type="email" value={form.email} onChange={updateField} />
            <Input id="organization" name="organization" label="Organization" value={form.organization} onChange={updateField} />
            <Input id="idProofNo" name="idProofNo" label="ID proof number" value={form.idProofNo} onChange={updateField} />
            <Input id="address" name="address" label="Address" value={form.address} onChange={updateField} />

            <Select
              id="visitingPurpose"
              name="visitingPurpose"
              label="Visiting purpose"
              value={form.visitingPurpose}
              onChange={updateField}
              required
            >
              <option value="">Select purpose</option>
              <option value="Audit">Audit</option>
              <option value="Relative">Relative</option>
              <option value="Suppliers">Suppliers</option>
              <option value="Others">Others</option>
            </Select>

            <Input
              id="validationHours"
              name="validationHours"
              label="Valid for (hours)"
              type="number"
              min="1"
              max="168"
              value={form.validationHours}
              onChange={updateField}
              hint="Between 1 and 168 hours"
              required
            />

            <div className="sm:col-span-2">
              <Textarea
                id="remarks"
                name="remarks"
                label="Remarks"
                rows={2}
                value={form.remarks}
                onChange={updateField}
              />
            </div>
          </div>
        </Card>

        <Card
          title="Visiting employee / director"
          description="Look up by Employee ID to fetch their details."
          className="rise"
          style={{ "--i": 2 }}
        >
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                value={employeeId}
                onChange={(event) => {
                  setEmployeeId(event.target.value);
                  setEmployee(null);
                  setSearchError("");
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleEmployeeSearch();
                  }
                }}
                aria-label="Employee ID"
                aria-invalid={Boolean(searchError)}
                placeholder="EMP0001"
                className="field font-mono uppercase placeholder:normal-case placeholder:font-sans"
              />
            </div>

            <Button
              variant="secondary"
              onClick={handleEmployeeSearch}
              loading={searching}
              loadingText="Searching"
            >
              <Search size={13} />
              Search
            </Button>
          </div>

          {searchError && (
            <p role="alert" className="mt-2 text-xs text-red-600">
              {searchError}
            </p>
          )}

          {employee && (
            <div className="animate-pop mt-3 rounded-card border border-emerald-200 bg-emerald-50/50 p-3">
              <div className="mb-2.5 flex items-center gap-2">
                <Avatar name={employee.name} size={26} />
                <p className="text-[13px] font-semibold text-ink">
                  {employee.name}
                </p>
                <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                  <CheckCircle2 size={12} />
                  Selected
                </span>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
                <Detail label="Employee ID" value={employee.employeeId} />
                <Detail label="Department" value={employee.department} />
                <Detail label="Role" value={employee.role} />
                <Detail label="Phone" value={employee.phone} />
                <div className="col-span-2">
                  <Detail label="Email" value={employee.email} />
                </div>
              </div>
            </div>
          )}
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            size="lg"
            loading={submitting}
            loadingText="Registering..."
            disabled={searching || !employee}
          >
            <UserPlus size={14} />
            Register visitor
          </Button>
        </div>
      </form>
    </div>
  );
};

export default VisitorRegistrationPage;
