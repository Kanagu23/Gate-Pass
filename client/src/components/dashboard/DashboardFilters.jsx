
import Card from "../common/Card";
import Select from "../common/Select";
import Input from "../common/Input";

import { DASHBOARD_DATE_RANGES } from "../../config/dashboardFilters";

const DashboardFilters = ({
  filters,
  onChange,
  divisions = [],
  departments = [],
  canSelectDivision = false,
  loading = false,
}) => {
  const updateFilter = (field, value) => {
    onChange({
      ...filters,
      [field]: value,
      ...(field === "division"
        ? { department: "" }
        : {}),
    });
  };

  return (
    <Card
      title="Report Filters"
      description="Filter dashboard statistics and charts."
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {canSelectDivision && (
          <Select
            id="dashboard-division"
            label="Division"
            value={filters.division}
            disabled={loading}
            onChange={(event) =>
              updateFilter("division", event.target.value)
            }
          >
            <option value="">All Divisions</option>

            {divisions.map((division) => (
              <option
                key={division.code}
                value={division.code}
              >
                {division.name}
              </option>
            ))}
          </Select>
        )}

        <Select
          id="dashboard-department"
          label="Department"
          value={filters.department}
          disabled={loading}
          onChange={(event) =>
            updateFilter("department", event.target.value)
          }
        >
          <option value="">All Departments</option>

          {departments.map((department) => (
            <option
              key={department._id || department.code}
              value={department.code}
            >
              {department.name}
            </option>
          ))}
        </Select>

        <Select
          id="dashboard-date-range"
          label="Date Range"
          value={filters.dateRange}
          disabled={loading}
          onChange={(event) =>
            updateFilter("dateRange", event.target.value)
          }
        >
          {DASHBOARD_DATE_RANGES.map((range) => (
            <option
              key={range.value}
              value={range.value}
            >
              {range.label}
            </option>
          ))}
        </Select>

        {filters.dateRange === "custom" && (
          <>
            <Input
              id="dashboard-start-date"
              label="From Date"
              type="date"
              value={filters.startDate}
              max={filters.endDate || undefined}
              disabled={loading}
              onChange={(event) =>
                updateFilter("startDate", event.target.value)
              }
            />

            <Input
              id="dashboard-end-date"
              label="To Date"
              type="date"
              value={filters.endDate}
              min={filters.startDate || undefined}
              disabled={loading}
              onChange={(event) =>
                updateFilter("endDate", event.target.value)
              }
            />
          </>
        )}
      </div>
    </Card>
  );
};

export default DashboardFilters;
