
import api from "./index";

// Retrieve an approved visitor's printable pass.
export const getVisitorPass = async (visitorId) => {
  const response = await api.get(
    `/visitors/${visitorId}/pass`
  );

  return response.data;
};
