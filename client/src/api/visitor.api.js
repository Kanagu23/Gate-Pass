
import api from "./index";

// Retrieve an approved visitor's printable pass.
export const getVisitorPass = async (visitorId) => {
  const response = await api.get(
    `/visitors/${visitorId}/pass`
  );

  return response.data;
};

export const searchVisitingEmployee = async (employeeId) => {
  const response = await api.get(
    `/employees/search/${encodeURIComponent(employeeId.trim())}`
  );

  return response.data;
};

export const registerVisitor = async (visitorData) => {
  const response = await api.post(
    "/visitors",
    visitorData
  );

  return response.data;
};


export const getVisitors = async (status = "") => {
  const response = await api.get("/visitors", {
    params: status ? { status } : {},
  });

  return response.data;
};


export const checkOutVisitorByQR = async (qrToken) => {
  const response = await api.patch(
    "/visitors/check-out/qr",
    { qrToken }
  );

  return response.data;
};


export const getVisitorHistory = async (status = "") => {
  const response = await api.get("/visitors/history", {
    params: status ? { status } : {},
  });

  return response.data;
};
