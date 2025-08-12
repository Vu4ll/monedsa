import axios from "axios";
import { API_CONFIG } from "../constants";
import { authService } from "./authService";
import i18n from "../i18n";

const api = axios.create();

function t(key, options = {}) {
  return i18n.t(key, options);
}

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
    if (error.response && error.response.status === 429) {
      return Promise.reject({
        ...error,
        customMessage: t("transactionService.ratelimit")
      });
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
    const searchParams = new URLSearchParams();

    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] !== undefined && queryParams[key] !== null && queryParams[key] !== '') {
        searchParams.append(key, queryParams[key]);
      }
    });

    const queryString = searchParams.toString();
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TRANSACTION.LIST}${queryString ? '?' + queryString : ''}`;

    const response = await api.get(url);
    return response.data ? response.data : t("transactionService.noData");
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
      if (error.customMessage) {
        return { success: false, error: error.customMessage };
      }

      throw new Error(error.response?.data?.message || t("transactionService.addError"));
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
      throw new Error(error.response?.data?.message || t("transactionService.updateError"));
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
      throw new Error(error.response?.data?.message || t("transactionService.ratelimit"));
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
      throw new Error(error.response?.data?.message || t("transactionService.getExpenseError"));
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
      throw new Error(error.response?.data?.message || t("transactionService.getIncomeError"));
    }
  },
};
