import axios from "axios";
import { API_CONFIG } from "../constants";
import { authService } from "./authService";

export const expenseService = {
  async getExpenses() {
    const token = authService.getToken();

    if (!token) {
      throw new Error('Token bulunamadı. Lütfen tekrar giriş yapın.');
    }

    if (!authService.isTokenValid()) {
      throw new Error('Token süresi dolmuş. Lütfen tekrar giriş yapın.');
    }

    const response = await axios.get(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EXPENSE_LIST}`,
      {
        headers: {
          "Authorization": `Bearer ${token}`,
          ...API_CONFIG.HEADERS,
        },
      }
    );

    return response.data ? response.data : "Veri yok";
  },
};
