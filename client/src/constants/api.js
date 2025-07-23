export const API_CONFIG = {
  BASE_URL: "http://10.70.2.11:3030",

  ENDPOINTS: {
    TRANSACTION: {
      LIST: "/api/transaction/list",
      ADD: "/api/transaction/add",
      EDIT: "/api/transaction/edit/",
      DELETE: "/api/transaction/delete/",
      EXPENSES: "/api/transaction/expenses",
      INCOMES: "/api/transaction/incomes"
    },

    AUTH: {
      LOGIN: "/api/auth/login",
      REGISTER: "/api/auth/register",
      REFRESH: "/api/auth/refresh"
    },

    CATEGORY: {
      LIST: "/api/category/list?",
      ADD: "/api/category/add",
      EDIT: "/api/category/edit/",
      DELETE: "/api/category/delete/",
    },

    PROFILE: {
      ME: "/api/profile/me",
      STATS: "/api/profile/stats",
      UPDATE: "/api/profile/update",
      CHANGE_PASSWORD: "/api/profile/change-password",
    },

    SUPPORT: {
      ISSUE: "/api/support/issue",
    },
  },

  HEADERS: {
    "Content-Type": "application/json",
  },
};
