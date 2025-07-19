import axios from 'axios';
import { API_CONFIG } from '../constants';
import { authService } from './authService';

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
 * @description CategoryService handles category-related API requests.
 */
class CategoryService {

  /**
   * @description Fetches categories from the server.
   * @param { string | null } type - The type of categories to fetch (optional).
   * @param { boolean | null } showOnlyDefault - Whether to show only default categories (optional).
   * @return { Promise<{ success: boolean, data?: any, error?: string }> }
   */
  async getCategories(type = null, showOnlyDefault = null) {
    try {
      const queryParams = new URLSearchParams();
      if (type) queryParams.append('type', type);
      if (showOnlyDefault !== null) queryParams.append('default', showOnlyDefault);

      const response = await api.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CATEGORY.LIST}${queryParams.toString()}`
      );

      const data = response.data;
      if (data.success) {
        return { success: true, data: data.data };
      } else {
        return { success: false, error: data.message || 'Kategoriler yüklenemedi' };
      }
    } catch (error) {
      console.error('Kategori listeleme hatası:', error);
      return { success: false, error: 'Bağlantı hatası' };
    }
  }

  /**
   * @description Adds a new category.
   * @param { Object } categoryData - The data of the category to add.
   * @param { boolean } useAdminRoute - Whether to use the admin route for the request.
   * @return { Promise<{ success: boolean, data?: any, error?: string }> }
   */
  async addCategory(categoryData, useAdminRoute = false) {
    try {
      const response = await api.post(`${API_CONFIG.BASE_URL}${useAdminRoute ? API_CONFIG.ENDPOINTS.CATEGORY.ADMIN.ADD : API_CONFIG.ENDPOINTS.CATEGORY.ADD}`, categoryData);

      const data = response.data;
      if (data.success) {
        return { success: true, data: data.data };
      } else {
        return { success: false, error: data.message || 'Kategori eklenemedi' };
      }
    } catch (error) {
      console.error('Kategori ekleme hatası:', error);
      return { success: false, error: 'Bağlantı hatası' };
    }
  }

  /**
   * @description Updates an existing category.
   * @param { string } categoryId - The ID of the category to update.,
   * @param { Object } categoryData - The updated data for the category.
   * @param { boolean } useAdminRoute - Whether to use the admin route for the request.
   * @return { Promise<{ success: boolean, data?: any, error?: string }> } 
   */
  async updateCategory(categoryId, categoryData, useAdminRoute = false) {
    console.log(categoryData);
    try {
      const response = await api.put(`${API_CONFIG.BASE_URL}${useAdminRoute ? API_CONFIG.ENDPOINTS.CATEGORY.ADMIN.EDIT : API_CONFIG.ENDPOINTS.CATEGORY.EDIT}${categoryId}`, categoryData);

      const data = response.data;
      if (data.success) {
        return { success: true, data: data.data };
      } else {
        return { success: false, error: data.message || 'Kategori güncellenemedi' };
      }
    } catch (error) {
      console.error('Kategori güncelleme hatası:', error);
      return { success: false, error: 'Bağlantı hatası' };
    }
  }

  /**
   * @description Deletes a category.
   * @param { string } categoryId - The ID of the category to delete.
   * @param { boolean } useAdminRoute - Whether to use the admin route for the request.
   * @return { Promise<{ success: boolean, data?: any, error?: string }> }
   */
  async deleteCategory(categoryId, useAdminRoute = false) {
    try {
      const response = await api.delete(`${API_CONFIG.BASE_URL}${useAdminRoute ? API_CONFIG.ENDPOINTS.CATEGORY.ADMIN.DELETE : API_CONFIG.ENDPOINTS.CATEGORY.DELETE}${categoryId}`);

      const data = response.data;
      if (data.success) {
        return { success: true, data: data.data };
      } else {
        return { success: false, error: data.message || 'Kategori silinemedi' };
      }
    } catch (error) {
      if (error.response && error.response.data) {
        const errorData = error.response.data;

        if (errorData.status === 400 && errorData.data && errorData.data.relatedTransactionsCount > 0) {
          const { categoryInfo, relatedTransactionsCount } = errorData.data;
          return {
            success: false,
            error: `${categoryInfo.name} kategorisi silinemez. Bu kategoriyle ilişkili ${relatedTransactionsCount} adet işlem bulunmaktadır.`,
            relatedTransactionsCount: relatedTransactionsCount,
            categoryInfo: categoryInfo
          };
        }

        return { success: false, error: errorData.message || 'Kategori silinemedi' };
      }

      console.error('Kategori silme hatası:', error);
      return { success: false, error: 'Bağlantı hatası' };
    }
  }
}

export const categoryService = new CategoryService();