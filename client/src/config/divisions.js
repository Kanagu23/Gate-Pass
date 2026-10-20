export const DIVISIONS = [
  { code: "FWD-I", name: "FWD Unit I" },
  { code: "FWD-II", name: "FWD Unit II" },
  { code: "FWD-III", name: "FWD Unit III" },
  { code: "FWD-IV", name: "FWD Unit IV" },
  { code: "FWD-FCD", name: "FWD-FCD" },
];
export const divisionName = (code) => DIVISIONS.find((division) => division.code === code)?.name || code || "Division not assigned";
