import api from "../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const login = async (phoneNumber, password) => {
  try {
    const response = await api.post("/auth/login", { phoneNumber, password });
    const { token, userId, role } = response.data;
    await AsyncStorage.setItem("userToken", token);
    await AsyncStorage.setItem("userId", userId);
    await AsyncStorage.setItem("userRole", role);
    return { token, userId, role };
  } catch (error) {
    throw error;
  }
};

export const register = async (username, phoneNumber, password) => {
  try {
    const response = await api.post("/auth/register", { username, phoneNumber, password });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    await AsyncStorage.removeItem("userToken");
    await AsyncStorage.removeItem("userId");
    await AsyncStorage.removeItem("userRole");
  } catch (error) {
    console.error("Error logging out:", error);
    throw error;
  }
};
