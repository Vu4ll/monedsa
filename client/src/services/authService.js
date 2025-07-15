import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../constants';

class AuthService {
  constructor() {
    this.token = null;
    this.refreshToken = null;
  }

  setToken(token, refreshToken) {
    this.token = token;
    this.refreshToken = refreshToken;
    AsyncStorage.setItem('authToken', token);
    if (refreshToken) {
      AsyncStorage.setItem('refreshToken', refreshToken);
    }
  }

  getToken() {
    return this.token;
  }

  getRefreshToken() {
    return this.refreshToken;
  }

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

  isTokenValid() {
    if (!this.token) return false;

    try {
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      const currentTime = Date.now() / 1000;

      return payload.exp > currentTime;
    } catch (error) {
      console.error('Token geçerlilik kontrolü hatası:', error);
      return false;
    }
  }

  async refreshAccessToken() {
    if (!this.refreshToken) return null;
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH_REFRESH}`, {
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

  async register(userData) {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH_REGISTER}`, {
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
        let errorMessage = data.message || 'Kayıt başarısız';

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

      if (error.name === 'TypeError' && error.message.includes('Network')) {
        return { success: false, error: 'İnternet bağlantısı hatası' };
      }

      return { success: false, error: 'Beklenmeyen bir hata oluştu' };
    }
  }

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

  async logout() {
    await this.clearToken();
  }

  async getProfile() {
    try {
      if (!this.token) {
        return { success: false, error: 'Token bulunamadı' };
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/api/profile/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return { success: true, data: data.data };
      } else {
        let errorMessage = data.message || 'Profil bilgileri alınamadı';

        if (response.status === 401) {
          errorMessage = 'Oturum süresi dolmuş';
          await this.clearToken();
        } else if (response.status === 403) {
          errorMessage = 'Bu işlem için yetkiniz yok';
        } else if (response.status >= 500) {
          errorMessage = 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.';
        }

        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('Profile hatası:', error);

      if (error.name === 'TypeError' && error.message.includes('Network')) {
        return { success: false, error: 'İnternet bağlantısı hatası' };
      }

      return { success: false, error: 'Beklenmeyen bir hata oluştu' };
    }
  }
}

export const authService = new AuthService();
