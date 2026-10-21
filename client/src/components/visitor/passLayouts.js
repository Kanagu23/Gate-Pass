
export const PASS_LAYOUTS = [
  {
    id: "a6",
    label: "A6 (¼ of A4)",
    description: "105 × 148 mm page. Print on A6 stock, or 4-up on A4.",
    kind: "card",
  },
  {
    id: "a4-quarter",
    label: "A4 sheet (¼ used)",
    description: "A4 page with the pass in the top-left quarter and cut guides.",
    kind: "card",
    sheet: "A4",
  },
  {
    id: "thermal-80",
    label: "Thermal 80 mm",
    description: "80 mm receipt roll. Length adjusts to the content.",
    kind: "roll",
    widthMm: 80,
  },
  {
    id: "thermal-58",
    label: "Thermal 58 mm",
    description: "58 mm receipt roll. Length adjusts to the content.",
    kind: "roll",
    widthMm: 58,
  },
];

export const DEFAULT_LAYOUT = "a6";

export const getLayout = (id) =>
  PASS_LAYOUTS.find((layout) => layout.id === id) ||
  PASS_LAYOUTS.find((layout) => layout.id === DEFAULT_LAYOUT);