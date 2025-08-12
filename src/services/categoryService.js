import axios from 'axios';
import { API_CONFIG } from '../constants';
import { authService } from './authService';
import i18n from '../i18n';

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
        customMessage: t("categoryService.ratelimit")
      });
    }
    return Promise.reject(error);
  }
);

/**
 * @description CategoryService handles category-related API requests.
 */
class CategoryService {

  /**
   * @description Checks if a category with the same name and type already exists.
   * @param { string } name - The category name to check.
   * @param { string } type - The category type to check.
   * @param { string | null } excludeId - Category ID to exclude from check (for updates).
   * @return { Promise<{ exists: boolean, categoryName?: string, categoryType?: string }> }
   */
  async checkCategoryExists(name, type, excludeId = null) {
    try {
      const result = await this.getCategories();
      if (result.success && result.data) {
        const existingCategory = result.data.find(category =>
          category.name.toLowerCase() === name.toLowerCase() &&
          category.type === type &&
          (excludeId ? category.id !== excludeId : true)
        );

        if (existingCategory) {
          return {
            exists: true,
            categoryName: existingCategory.name,
            categoryType: existingCategory.type
          };
        }
      }
      return { exists: false };
    } catch (error) {
      console.error('Category check error:', error);
      return { exists: false };
    }
  }

  /**
   * @description Fetches categories from the server.
   * @param { string | null } type - The type of categories to fetch (optional).
   * @return { Promise<{ success: boolean, data?: any, error?: string }> }
   */
  async getCategories(type = null) {
    try {
      const queryParams = new URLSearchParams();
      if (type) queryParams.append('type', type);

      const response = await api.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CATEGORY.LIST}${queryParams.toString()}`
      );

      const data = response.data;
      if (data.success) {
        return { success: true, data: data.data };
      } else {
        return { success: false, error: data.message || t("categoryService.getCategories.fail") };
      }
    } catch (error) {
      console.error('Category list error:', error);
      return { success: false, error: t("categoryService.network") };
    }
  }

  /**
   * @description Adds a new category.
   * @param { Object } categoryData - The data of the category to add.
   * @return { Promise<{ success: boolean, data?: any, error?: string }> }
   */
  async addCategory(categoryData) {
    try {
      const response = await api.post(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CATEGORY.ADD}`, categoryData);

      const data = response.data;
      if (data.success) {
        return { success: true, data: data.data };
      } else {
        return { success: false, error: data.message || t("categoryService.addCategory.fail") };
      }
    } catch (error) {
      if (error.customMessage) {
        return { success: false, error: error.customMessage };
      }

      if (error.response && error.response.data) {
        const errorData = error.response.data;

        if (errorData.status === 400 && errorData.message) {
          if (errorData.message.includes('already exists')) {
            const typeText = categoryData.type === 'income' ? t("common.income") : t("common.expense");
            return {
              success: false,
              error: t("categoryService.nameError", { type: typeText, name: categoryData.name })
            };
          }

          return { success: false, error: errorData.message };
        }

        return { success: false, error: errorData.message || t("categoryService.addCategory.fail") };
      }

      return { success: false, error: t("categoryService.network") };
    }
  }

  /**
   * @description Updates an existing category.
   * @param { string } categoryId - The ID of the category to update.,
   * @param { Object } categoryData - The updated data for the category.
   * @return { Promise<{ success: boolean, data?: any, error?: string }> } 
   */
  async updateCategory(categoryId, categoryData) {
    try {
      const response = await api.put(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CATEGORY.EDIT}${categoryId}`, categoryData);

      const data = response.data;
      if (data.success) {
        return { success: true, data: data.data };
      } else {
        return { success: false, error: data.message || t("categoryService.updateCategory.fail") };
      }
    } catch (error) {
      if (error.customMessage) {
        return { success: false, error: error.customMessage };
      }

      if (error.response && error.response.data) {
        const errorData = error.response.data;

        if (errorData.status === 400 && errorData.message) {
          if (errorData.message.includes('already exists')) {

            const typeText = categoryData.type === 'income' ? t("common.income") : t("common.expense");
            return {
              success: false,
              error: t("categoryService.nameError", { type: typeText, name: categoryData.name })
            };
          }

          return { success: false, error: errorData.message };
        }

        return { success: false, error: errorData.message || t("categoryService.updateCategory.fail") };
      }

      return { success: false, error: t("categoryService.network") };
    }
  }

  /**
   * @description Deletes a category.
   * @param { string } categoryId - The ID of the category to delete.
   * @return { Promise<{ success: boolean, data?: any, error?: string }> }
   */
  async deleteCategory(categoryId) {
    try {
      const response = await api.delete(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CATEGORY.DELETE}${categoryId}`);

      const data = response.data;
      if (data.success) {
        return { success: true, data: data.data };
      } else {
        return { success: false, error: data.message || t("categoryService.deleteCategory.fail") };
      }
    } catch (error) {
      if (error.response && error.response.data) {
        if (error.customMessage) {
          return { success: false, error: error.customMessage };
        }

        if (errorData.status === 400 && errorData.data && errorData.data.relatedTransactionsCount > 0) {
          const { categoryInfo, relatedTransactionsCount } = errorData.data;
          return {
            success: false,
            error: t("categoryService.deleteCategory.relatedTransactions", { name: categoryInfo.name, count: relatedTransactionsCount }),
            relatedTransactionsCount: relatedTransactionsCount,
            categoryInfo: categoryInfo
          };
        }

        return { success: false, error: errorData.message || t("categoryService.deleteCategory.fail") };
      }

      console.error('Category delete error:', error);
      return { success: false, error: t("categoryService.network") };
    }
  }
}

export const categoryService = new CategoryService();