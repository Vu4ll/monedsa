import axios from "axios";
import { API_CONFIG } from "../constants";
import { authService } from "./authService";

const api = axios.create();

api.interceptors.request.use(async (config) => {
  let token = authService.getToken();
  if (!token) {
    await authService.loadToken();
    token = authService.getToken();
  }
  config.headers = {
    ...API_CONFIG.HEADERS,
    Authorization: `Bearer ${token}`,
  };
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const newToken = await authService.refreshAccessToken();
      if (newToken) {
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return api(originalRequest);
      } else {
        await authService.clearToken();
      }
    }
    return Promise.reject(error);
  }
);

export const transactionService = {
  async getTransaction() {
    const response = await api.get(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TRANSACTION.LIST}`
    );
    return response.data ? response.data : "Veri yok";
  },

  async addTransaction(transactionData) {
    try {
      const response = await api.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TRANSACTION.ADD}`,
        transactionData
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Transaction eklenirken bir hata oluştu');
    }
  },

  async updateTransaction(transactionId, transactionData) {
    try {
      const response = await api.put(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TRANSACTION.EDIT}${transactionId}`,
        transactionData
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Transaction güncellenirken bir hata oluştu');
    }
  },

  async deleteTransaction(transactionId) {
    try {
      const response = await api.delete(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TRANSACTION.DELETE}${transactionId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Transaction silinirken bir hata oluştu');
    }
  },

  async getExpenses() {
    try {
      const response = await api.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TRANSACTION.EXPENSES}`
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Giderler yüklenirken bir hata oluştu');
    }
  },

  async getIncomes() {
    try {
      const response = await api.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TRANSACTION.INCOMES}`
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Gelirler yüklenirken bir hata oluştu');
    }
  },
};
