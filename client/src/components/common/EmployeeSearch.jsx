
import { useEffect, useState } from "react";
import { Search, UserRound, X } from "lucide-react";

import { searchEmployees } from "../../api/employee.api";
import Input from "./Input";

const EmployeeSearch = ({
  department = "",
  value = null,
  onChange,
  label = "Search employee",
  role = "VISITING_EMPLOYEE"
}) => {
  const [query, setQuery] = useState("");
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (value || (!query.trim() && !department)) {
      setEmployees([]);
      return;
    }

    let active = true;

    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const response = await searchEmployees({
          query: query.trim(),
          department,
          role,
        });

        if (active) {
          setEmployees(response.employees || []);
        }
      } catch (err) {
        if (active) {
          setEmployees([]);
          setError("Unable to search employees.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query, department, role, value]);

  const selectEmployee = (employee) => {
    onChange(employee);
    setQuery("");
    setEmployees([]);
  };

  const clearEmployee = () => {
    onChange(null);
    setQuery("");
    setEmployees([]);
  };

  return (
    <div className="space-y-2">
      {value ? (
        <div className="flex items-center justify-between gap-3 rounded-card border border-line bg-white p-3">
          <div className="flex items-center gap-3">
            <UserRound size={18} className="text-brand" />

            <div>
              <p className="text-sm font-semibold text-ink">
                {value.name}
              </p>

              <p className="text-xs text-slate-500">
                {value.employeeId} · {value.department}
              </p>

              <p className="text-xs text-slate-500">
                {value.email}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={clearEmployee}
            className="text-slate-500 hover:text-ink"
            aria-label="Clear selected employee"
          >
            <X size={17} />
          </button>
        </div>
      ) : (
        <>
          <div className="relative">
            <Input
              label={label}
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="Name, email, or employee ID"
              autoComplete="off"
            />
          </div>

          {loading && (
            <p className="text-xs text-slate-500">
              Searching employees...
            </p>
          )}

          {error && (
            <p role="alert" className="text-xs text-red-600">
              {error}
            </p>
          )}

          {employees.length > 0 && (
            <div className="max-h-64 overflow-y-auto rounded-card border border-line bg-white shadow-card">
              {employees.map((employee) => (
                <button
                  key={employee.id}
                  type="button"
                  onClick={() => selectEmployee(employee)}
                  className="flex w-full items-center gap-3 border-b border-line px-3 py-3 text-left last:border-b-0 hover:bg-slate-50"
                >
                  <UserRound
                    size={17}
                    className="text-brand"
                  />

                  <div>
                    <p className="text-sm font-medium text-ink">
                      {employee.name}
                    </p>

                    <p className="text-xs text-slate-500">
                      {employee.employeeId} ·{" "}
                      {employee.department} ·{" "}
                      {employee.role}
                    </p>

                    <p className="text-xs text-slate-500">
                      {employee.email}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {!loading &&
            !error &&
            query.trim() &&
            employees.length === 0 && (
              <p className="text-xs text-slate-500">
                No matching employees found.
              </p>
            )}
        </>
      )}
    </div>
  );
};

export default EmployeeSearch;
