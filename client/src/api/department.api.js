
import api from "./index";

export const getDepartments = async () => {
  const response = await api.get("/departments");
  return response.data;
};

export const createDepartment = async (departmentData) => {
  const response = await api.post(
    "/departments",
    departmentData
  );

  return response.data;
};


export const assignDepartmentHead = async (
  departmentId,
  employeeId
) => {
  const response = await api.patch(
    `/departments/${departmentId}/head`,
    { employeeId }
  );

  return response.data;
};
