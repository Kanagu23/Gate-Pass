
export const DASHBOARD_DATE_RANGES = [
  { value: "today", label: "Today" },
  { value: "7days", label: "Last 7 Days" },
  { value: "30days", label: "Last 30 Days" },
  { value: "custom", label: "Custom Range" },
];

export const DEFAULT_DASHBOARD_FILTERS = {
  division: "",
  department: "",
  dateRange: "7days",
  startDate: "",
  endDate: "",
};

export const buildDashboardParams = (filters) => {
  const params = {
    dateRange: filters.dateRange,
  };

  if (filters.division) {
    params.division = filters.division;
  }

  if (filters.department) {
    params.department = filters.department;
  }

  if (filters.dateRange === "custom") {
    if (filters.startDate) {
      params.startDate = filters.startDate;
    }

    if (filters.endDate) {
      params.endDate = filters.endDate;
    }
  }

  return params;
};
