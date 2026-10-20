const DIVISIONS = Object.freeze([
  { code: "FWD-I", name: "FWD Unit I" },
  { code: "FWD-II", name: "FWD Unit II" },
  { code: "FWD-III", name: "FWD Unit III" },
  { code: "FWD-IV", name: "FWD Unit IV" },
  { code: "FWD-FCD", name: "FWD-FCD" },
]);
const isDivision = (code) => DIVISIONS.some((division) => division.code === code);
module.exports = { DIVISIONS, isDivision };
