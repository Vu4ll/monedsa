export const API_CONFIG = {
  BASE_URL: "http://10.70.2.9:3000",
  ENDPOINTS: {
    TRANSACTION: { 
      LIST: "/api/transaction/list",
      ADD: "/api/transaction/add",
      EDIT: "/api/transaction/edit/",
      DELETE: "/api/transaction/delete/",
      EXPENSES: "/api/transaction/expenses",
      INCOMES: "/api/transaction/incomes"
    },
    AUTH_LOGIN: "/api/auth/login",
    AUTH_REGISTER : "/api/auth/register",
    AUTH_REFRESH: "/api/auth/refresh",
  },
  HEADERS: {
    "Content-Type": "application/json",
  },
};
