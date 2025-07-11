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

class CategoryService {
  
  // Kategorileri listele
  async getCategories(type = null, showOnlyDefault = null) {
    try {
      const queryParams = new URLSearchParams();
      if (type) queryParams.append('type', type);
      if (showOnlyDefault !== null) queryParams.append('default', showOnlyDefault);
      
      const response = await api.get(
        `${API_CONFIG.BASE_URL}/api/category/list?${queryParams.toString()}`
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

  // Kategori ekle
  async addCategory(categoryData) {
    try {
      const response = await api.post(`${API_CONFIG.BASE_URL}/api/category/add`, categoryData);
      
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

  // Kategori düzenle
  async updateCategory(categoryId, categoryData) {
    try {
      const response = await api.put(`${API_CONFIG.BASE_URL}/api/category/edit/${categoryId}`, categoryData);
      
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

  // Kategori sil
  async deleteCategory(categoryId) {
    try {
      const response = await api.delete(`${API_CONFIG.BASE_URL}/api/category/delete/${categoryId}`);
      
      const data = response.data;
      if (data.success) {
        return { success: true, data: data.data };
      } else {
        return { success: false, error: data.message || 'Kategori silinemedi' };
      }
    } catch (error) {
      console.error('Kategori silme hatası:', error);
      return { success: false, error: 'Bağlantı hatası' };
    }
  }
}

// Singleton instance
export const categoryService = new CategoryService();
