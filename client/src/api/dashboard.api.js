
import api from "./index";

export const getDashboardStats = async (params = {}) => {
  const response = await api.get("/dashboard/stats", {
    params,
  });

  return response.data;
};

export const getDashboardAnalytics = async (params = {}) => {
  const response = await api.get("/dashboard/analytics", {
    params,
  });

  return response.data;
};

export const getRecentVisitors = async (params = {}) => {
  const response = await api.get(
    "/dashboard/recent-visitors",
    { params }
  );

  return response.data;
};
