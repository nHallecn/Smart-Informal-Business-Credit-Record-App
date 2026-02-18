import api from "../config/api";

export const getCreditScoreAPI = async (userId) => {
  try {
    const response = await api.get(`/scores/user/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const recalculateCreditScoreAPI = async (userId) => {
  try {
    const response = await api.post(`/scores/recalculate/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
