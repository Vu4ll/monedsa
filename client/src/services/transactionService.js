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

/**
 * @description TransactionService handles transaction-related API requests.
 * This service provides methods to fetch, add, update, and delete transactions,
 */
export const transactionService = {
  async getTransaction(queryParams = {}) {
    // Query parametrelerini URL'e çevir
    const searchParams = new URLSearchParams();
    
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] !== undefined && queryParams[key] !== null && queryParams[key] !== '') {
        searchParams.append(key, queryParams[key]);
      }
    });
    
    const queryString = searchParams.toString();
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TRANSACTION.LIST}${queryString ? '?' + queryString : ''}`;
    
    const response = await api.get(url);
    return response.data ? response.data : "Veri yok";
  },

  /**
   * @description Adds a new transaction.
   * @param { Object } transactionData - The data for the new transaction.
   * @return { Promise<Object> } The response data from the server.
   */
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

  /**
   * @description Updates an existing transaction.
   * @param { string } transactionId - The ID of the transaction to update.
   * @param { Object } transactionData - The updated data for the transaction.
   * @return { Promise<Object> } The response data from the server.
   */
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

  /**
   * @description Deletes a transaction.
   * @param { string } transactionId - The ID of the transaction to delete.
   * @return { Promise<Object> } The response data from the server.
   */
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

  /**
   * @description Fetches expenses from the server.
   * @returns { Promise<Object> } The response data from the server.
   */
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

  /**
   * @description Fetches incomes from the server.
   * @return { Promise<Object> } The response data from the server.
   */
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
