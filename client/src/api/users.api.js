
import api from "./index";

// Create a new internal user.
// Backend restricts this endpoint to Admin.
export const createUser = async (userData) => {
  const response = await api.post("/auth/users", userData);

  return response.data;
};

export const getUsers = async () => {
  const response = await api.get("/auth/users");
  return response.data;
};


export const updateUserStatus = async (userId, isActive) => {
  const response = await api.patch(
    `/auth/users/${userId}/status`,
    { isActive }
  );

  return response.data;
};


export const updateUserPermissions = async (
  userId,
  permissions
) => {
  const response = await api.patch(
    `/auth/users/${userId}/permissions`,
    { permissions }
  );

  return response.data;
};
