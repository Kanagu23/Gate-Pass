
import api from "./index";

// Fetch Admin dashboard statistics.
export const getDashboardStats = async () => {
  const response = await api.get("/dashboard/stats");

  return response.data;
};

// Fetch Admin dashboard analytics.
export const getDashboardAnalytics = async () => {
  const response = await api.get("/dashboard/analytics");

  return response.data;
};
