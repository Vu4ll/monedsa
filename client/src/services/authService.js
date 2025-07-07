import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../constants';

class AuthService {
  constructor() {
    this.token = null;
  }

  // Token'ı belleğe kaydet
  setToken(token) {
    this.token = token;
    // Ayrıca kalıcı depolama için AsyncStorage'a da kaydet
    AsyncStorage.setItem('authToken', token);
  }

  // Belleğden token'ı al
  getToken() {
    return this.token;
  }

  // Uygulama başlatıldığında AsyncStorage'dan token'ı yükle
  async loadToken() {
    try {
      const storedToken = await AsyncStorage.getItem('authToken');
      if (storedToken) {
        this.token = storedToken;
      }
      return this.token;
    } catch (error) {
      console.error('Token yükleme hatası:', error);
      return null;
    }
  }

  // Token'ı temizle (logout)
  async clearToken() {
    this.token = null;
    try {
      await AsyncStorage.removeItem('authToken');
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

  // Login işlemi (örnek)
  async login(user, password) {
    try {
      // Bu kısım gerçek API çağrısı olacak
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH_LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user, password }),
      });

      const data = await response.json();
      
      if (response.ok && data.token) {
        this.setToken(data.token);
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
