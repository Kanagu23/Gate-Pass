import { useState ,useEffect} from "react";
import { UserPlus } from "lucide-react";

import { registerVisitor } from "../../api/visitor.api";
import { getDepartments } from "../../api/department.api";
import EmployeeSearch from "../../components/common/EmployeeSearch";
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
  const [employee, setEmployee] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState(null);

  const [departments, setDepartments] = useState([]);
const [selectedDepartment, setSelectedDepartment] = useState("");
const [loadingDepartments, setLoadingDepartments] = useState(true);
const [departmentError, setDepartmentError] = useState("");
  const { user } = useAuth();

  const dashboardPath = user?.role === "ADMIN" ? "/admin" : "/gate";

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
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
      setSelectedDepartment("");
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

  
useEffect(() => {
  let active = true;

  const loadDepartments = async () => {
    try {
      const response = await getDepartments();

      if (active) {
        setDepartments(
          (response.departments || []).filter(
            (department) => department.isActive
          )
        );
      }
    } catch (error) {
      if (active) {
        setDepartmentError("Unable to load departments.");
      }
    } finally {
      if (active) setLoadingDepartments(false);
    }
  };

  loadDepartments();

  return () => {
    active = false;
  };
}, []);

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
  description="Select a department and find the person being visited."
  className="rise"
  style={{ "--i": 2 }}
>
  <div className="space-y-4">
    <Select
      id="visitingDepartment"
      label="Department"
      value={selectedDepartment}
      onChange={(event) => {
        setSelectedDepartment(event.target.value);
        setEmployee(null);
        setFormError("");
      }}
      disabled={loadingDepartments}
      required
    >
      <option value="">
        {loadingDepartments
          ? "Loading departments..."
          : "Select department"}
      </option>

      {departments.map((department) => (
        <option
          key={department._id}
          value={department.code}
        >
          {department.name}
        </option>
      ))}
    </Select>

    {departmentError && (
      <p role="alert" className="text-xs text-red-600">
        {departmentError}
      </p>
    )}

    {selectedDepartment && (
      <EmployeeSearch
        key={selectedDepartment}
        label="Search visiting employee"
        department={selectedDepartment}
        role="VISITING_EMPLOYEE"
        value={employee}
        onChange={setEmployee}
      />
    )}
  </div>
</Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            size="lg"
            loading={submitting}
            loadingText="Registering..."
            disabled={submitting || !employee}
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
