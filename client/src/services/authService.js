import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../constants';

class AuthService {
  constructor() {
    this.token = null;
    this.refreshToken = null;
  }

  // Token'ları belleğe kaydet
  setToken(token, refreshToken) {
    this.token = token;
    this.refreshToken = refreshToken;
    AsyncStorage.setItem('authToken', token);
    if (refreshToken) {
      AsyncStorage.setItem('refreshToken', refreshToken);
    }
  }

  // Belleğden token'ı al
  getToken() {
    return this.token;
  }

  // Refresh token'ı al
  getRefreshToken() {
    return this.refreshToken;
  }

  // Uygulama başlatıldığında token ve refresh token'ı yükle
  async loadToken() {
    try {
      const storedToken = await AsyncStorage.getItem('authToken');
      const storedRefreshToken = await AsyncStorage.getItem('refreshToken');
      if (storedToken) this.token = storedToken;
      if (storedRefreshToken) this.refreshToken = storedRefreshToken;
      return this.token;
    } catch (error) {
      console.error('Token yükleme hatası:', error);
      return null;
    }
  }

  // Token'ları temizle (logout)
  async clearToken() {
    this.token = null;
    this.refreshToken = null;
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('refreshToken');
    } catch (error) {
      console.error('Token temizleme hatası:', error);
    }
  }

  // Token'ın geçerli olup olmadığını kontrol et
  isTokenValid() {
    if (!this.token) return false;
    
    try {
      // JWT token'ın payload kısmını decode et
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      // Token'ın süresi dolmuş mu kontrol et
      return payload.exp > currentTime;
    } catch (error) {
      console.error('Token geçerlilik kontrolü hatası:', error);
      return false;
    }
  }

  // Token yenileme
  async refreshAccessToken() {
    if (!this.refreshToken) return null;
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });
      const data = await response.json();
      if (response.ok && data.token) {
        this.setToken(data.token, data.refreshToken || this.refreshToken);
        console.log("Token refreshed");
        return data.token;
      } else {
        await this.clearToken();
        return null;
      }
    } catch (error) {
      await this.clearToken();
      return null;
    }
  }

  // Register işlemi
  async register(userData) {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        return { success: true, data: data.data };
      } else {
        // Sunucudan gelen detaylı hata mesajını yakala
        let errorMessage = data.message || 'Kayıt başarısız';
        
        // HTTP status code'larına göre mesajları özelleştir
        if (response.status === 400) {
          errorMessage = data.message || 'Geçersiz veri girişi';
        } else if (response.status === 409) {
          errorMessage = data.message || 'Bu bilgiler zaten kayıtlı';
        } else if (response.status === 422) {
          errorMessage = data.message || 'Veri doğrulama hatası';
        } else if (response.status >= 500) {
          errorMessage = 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.';
        }
        
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('Register hatası:', error);
      
      // Network hataları için özel mesaj
      if (error.name === 'TypeError' && error.message.includes('Network')) {
        return { success: false, error: 'İnternet bağlantısı hatası' };
      }
      
      return { success: false, error: 'Beklenmeyen bir hata oluştu' };
    }
  }

  // Login işlemi (örnek)
  async login(user, password) {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH_LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user, password }),
      });
      const data = await response.json();
      if (response.ok && data.token) {
        this.setToken(data.token, data.refreshToken);
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.message || 'Giriş başarısız' };
      }
    } catch (error) {
      console.error('Login hatası:', error);
      return { success: false, error: 'Bağlantı hatası' };
    }
  }

  // Logout işlemi
  async logout() {
    await this.clearToken();
  }
}

// Singleton instance
export const authService = new AuthService();
