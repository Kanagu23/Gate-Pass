
import api from "./index";

// Get visitors awaiting approval by the logged-in employee.
export const getPendingVisitors = async () => {
  const response = await api.get("/visitors/pending");
  return response.data;
};

// Approve a visitor and automatically check them in.
export const approveVisitor = async (visitorId) => {
  const response = await api.patch(
    `/visitors/${visitorId}/approve`
  );

  return response.data;
};

// Reject a pending visitor.
export const rejectVisitor = async (visitorId) => {
  const response = await api.patch(
    `/visitors/${visitorId}/reject`
  );

  return response.data;
};
