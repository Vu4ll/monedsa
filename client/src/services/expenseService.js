import axios from "axios";
import { API_CONFIG } from "../constants";
import { authService } from "./authService";

// Axios interceptor ile otomatik token yenileme
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
        // Burada logout veya yönlendirme işlemi yapılabilir
      }
    }
    return Promise.reject(error);
  }
);

export const expenseService = {
  async getExpenses() {
    const response = await api.get(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EXPENSE_LIST}`
    );
    return response.data ? response.data : "Veri yok";
  },
};
