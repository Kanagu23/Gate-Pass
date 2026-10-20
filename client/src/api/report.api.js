import api from "./index";
export const getVisitorReport = async ({ from, to, division = "" }) => {
  const response = await api.get("/reports/visitors", { params: { from, to, ...(division ? { division } : {}) } });
  return response.data;
};
