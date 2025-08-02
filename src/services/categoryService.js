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
    if (error.response && error.response.status === 429) {
      return Promise.reject({
        ...error,
        customMessage: "Çok fazla deneme yaptınız, lütfen daha sonra tekrar deneyiniz."
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
      console.error('Kategori kontrol hatası:', error);
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
   * @return { Promise<{ success: boolean, data?: any, error?: string }> }
   */
  async addCategory(categoryData) {
    try {
      const response = await api.post(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CATEGORY.ADD}`, categoryData);

      const data = response.data;
      if (data.success) {
        return { success: true, data: data.data };
      } else {
        return { success: false, error: data.message || 'Kategori eklenemedi' };
      }
    } catch (error) {
      if (error.customMessage) {
        return { success: false, error: error.customMessage };
      }

      if (error.response && error.response.data) {
        const errorData = error.response.data;

        if (errorData.status === 400 && errorData.message) {
          if (errorData.message.includes('already exists')) {

            const typeText = categoryData.type === 'income' ? 'gelir' : 'gider';
            return {
              success: false,
              error: `Bu ${typeText} türünde ${categoryData.name} adında bir kategori zaten bulunuyor. Lütfen farklı bir isim seçiniz.`
            };
          }

          return { success: false, error: errorData.message };
        }

        return { success: false, error: errorData.message || 'Kategori eklenemedi' };
      }

      return { success: false, error: 'Bağlantı hatası' };
    }
  }

  /**
   * @description Updates an existing category.
   * @param { string } categoryId - The ID of the category to update.,
   * @param { Object } categoryData - The updated data for the category.
   * @return { Promise<{ success: boolean, data?: any, error?: string }> } 
   */
  async updateCategory(categoryId, categoryData) {
    console.log(categoryData);
    try {
      const response = await api.put(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CATEGORY.EDIT}${categoryId}`, categoryData);

      const data = response.data;
      if (data.success) {
        return { success: true, data: data.data };
      } else {
        return { success: false, error: data.message || 'Kategori güncellenemedi' };
      }
    } catch (error) {
      if (error.customMessage) {
        return { success: false, error: error.customMessage };
      }

      if (error.response && error.response.data) {
        const errorData = error.response.data;

        if (errorData.status === 400 && errorData.message) {
          if (errorData.message.includes('already exists')) {

            const typeText = categoryData.type === 'income' ? 'gelir' : 'gider';
            return {
              success: false,
              error: `Bu ${typeText} türünde ${categoryData.name} adında bir kategori zaten bulunuyor. Lütfen farklı bir isim seçiniz.`
            };
          }

          return { success: false, error: errorData.message };
        }

        return { success: false, error: errorData.message || 'Kategori güncellenemedi' };
      }

      return { success: false, error: 'Bağlantı hatası' };
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
        return { success: false, error: data.message || 'Kategori silinemedi' };
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