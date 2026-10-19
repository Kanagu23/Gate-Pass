
import api from "./index";



export const searchEmployees = async ({
  query = "",
  department = "",
  role = "VISITING_EMPLOYEE",
} = {}) => {
  const response = await api.get("/employees/search", {
    params: {
      q: query,
      department,
      role,
    },
  });

  return response.data;
};
