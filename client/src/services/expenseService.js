import axios from "axios";
import { API_CONFIG, AUTH_TOKEN } from "../constants";

export const expenseService = {
  async getExpenses() {
    const response = await axios.get(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EXPENSE_LIST}`,
      {
        headers: {
          "Authorization": `Bearer ${AUTH_TOKEN}`,
          ...API_CONFIG.HEADERS,
        },
      }
    );
    return response.data;
  },
};
