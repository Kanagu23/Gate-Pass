
import api from "./index";

// Create a new internal user.
// Backend restricts this endpoint to Admin.
export const createUser = async (userData) => {
  const response = await api.post("/auth/users", userData);

  return response.data;
};
