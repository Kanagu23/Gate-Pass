
import { getVisitorPass } from "./visitor.api";

export const testVisitorPass = async (visitorId) => {
  try {
    const data = await getVisitorPass(visitorId);

    console.log("Visitor Pass API:", {
      success: data.success,
      visitorId: data.visitor?.visitorId,
      status: data.visitor?.status,
      hasQrCode: Boolean(data.visitor?.qrCode),
    });

    return data;
  } catch (error) {
    console.error(
      "Visitor Pass API Error:",
      error.response?.data?.message || error.message
    );

    throw error;
  }
};
