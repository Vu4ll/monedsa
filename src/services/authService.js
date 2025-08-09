import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { getAuth, GoogleAuthProvider, signInWithCredential } from '@react-native-firebase/auth';
import { GOOGLE_WEB_CLIENT_ID } from '@env';
import { API_CONFIG } from '../constants';

/**
 * @description AuthService handles user authentication, token management, and profile retrieval.
 */
class AuthService {
  constructor() {
    this.token = null;
    this.refreshToken = null;
    this.configureGoogleSignIn();
  }

  /**
   * @description Configures Google Sign-In
   */
  configureGoogleSignIn() {
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
      offlineAccess: true,
    })
  }

  /**
   * @description Sets the authentication token and refresh token.
   * @param { string } token - The authentication token.
   * @param { string } refreshToken - The refresh token.
   */
  setToken(token, refreshToken) {
    this.token = token;
    this.refreshToken = refreshToken;
    AsyncStorage.setItem('authToken', token);
    if (refreshToken) {
      AsyncStorage.setItem('refreshToken', refreshToken);
    }
  }

  /**
   * @description Gets the current authentication token.
   * @returns { string | null } The current authentication token or null if not set.
   */
  getToken() {
    return this.token;
  }

  /**
   * @description Gets the current refresh token.
   * @returns { string | null } The current refresh token or null if not set.
   */
  getRefreshToken() {
    return this.refreshToken;
  }

  /**
   * @description Loads the authentication token from storage.
   * @returns { Promise<string | null> } The authentication token or null if not found.
   */
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

  /**
   * @description Clears the authentication token and refresh token from memory and storage.
   * @returns { Promise<void> }
   */
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

  /**
   * @description Checks if the current authentication token is valid.
   * @returns { boolean } True if the token is valid, false otherwise.
   */
  isTokenValid() {
    if (!this.token) {
      return false;
    }

    try {
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      const expiryTime = payload.exp;
      const timeRemaining = expiryTime - currentTime;

      if (timeRemaining > 0) {
        console.log(`Token geçerli - Kalan süre: ${Math.floor(timeRemaining / 60)} dakika`);
      } else {
        console.log('Token süresi dolmuş');
      }

      return timeRemaining > 0;
    } catch (error) {
      console.error('Token geçerlilik kontrolü hatası:', error);
      return false;
    }
  }

  /**
   * @description Refreshes the authentication token using the refresh token.
   * @return { Promise<string | null> } The new authentication token or null if refresh failed.
   */
  async refreshAccessToken() {
    if (!this.token) {
      await this.loadToken();
    }

    if (!this.refreshToken) {
      console.log('Refresh token bulunamadı');
      return await this.clearToken();
    }

    try {
      console.log('Refresh token ile yenileme yapılıyor...');
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REFRESH}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.token) {
        this.setToken(data.token, data.refreshToken || this.refreshToken);
        console.log("Token başarıyla yenilendi");
        return data.token;
      } else {
        console.log('Refresh token geçersiz veya süresi dolmuş');
        await this.clearToken();
        return null;
      }
    } catch (error) {
      console.error('Refresh token error:', error);
      await this.clearToken();
      return null;
    }
  }

  /**
   * @description Registers a new user.
   * @param { Object } userData - The user data for registration.
   * @return { Promise<{ success: boolean, data?: any, error?: string }> }
   */
  async register(userData) {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REGISTER}`, {
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
        } else if (response.status === 429) {
          errorMessage = data.message || "Çok fazla deneme yaptınız, lütfen daha sonra tekrar deneyiniz.";
        } else if (response.status >= 500) {
          errorMessage = 'Sunucu hatası. Lütfen daha sonra tekrar deneyiniz.';
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

  /**
   * @description Logs in a user with username and password.
   * @param { string } user - The username or email.
   * @param { string } password - The password.
   * @return { Promise<{ success: boolean, user?: any, error?: string }> }
   */
  async login(user, password) {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user, password }),
      });
      const data = await response.json();

      if (response.status === 429) {
        return { success: false, error: data.message };
      }
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

  /**
   * @description Signs in user with Google using Firebase Auth
   * @param { string } language - The language for the request.
   * @returns { Promise<{ success: boolean, user?: any, error?: string }> }
   */
  async googleLogin(language) {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      const signInResult = await GoogleSignin.signIn();
      const idToken = signInResult.data?.idToken;
      const authInstance = getAuth();
      const googleCredential = GoogleAuthProvider.credential(idToken);
      const firebaseUser = await signInWithCredential(authInstance, googleCredential);
      const firebaseIdToken = await firebaseUser.user.getIdToken();

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.GOOGLE}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idToken: firebaseIdToken,
          firebaseUid: firebaseUser.user.uid,
          language
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        this.setToken(data.token, data.refreshToken);
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.message || 'Google ile giriş başarısız' };
      }
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * @description Logs out the user by clearing the token.
   * @return { Promise<void> }
   */
  async logout() {
    try {
      await auth().signOut();
      await GoogleSignin.signOut();
      await this.clearToken();
    } catch (error) {
      await this.clearToken();
    }
  }

  /**
   * @description A helper function to make authenticated fetch requests, handling token refresh automatically.
   * @param {string} url - The URL to fetch.
   * @param {object} options - The options for the fetch request.
   * @returns {Promise<Response>} The fetch response.
   * @private
   */
  async _authenticatedFetch(url, options = {}) {
    if (!this.token) {
      await this.loadToken();
    }

    if (!this.token) {
      throw new Error('Token bulunamadı');
    }

    if (!this.isTokenValid()) {
      console.log('Token süresi dolmuş, yenileme yapılıyor...');
      const newToken = await this.refreshAccessToken();
      if (!newToken) {
        throw new Error('Oturum süresi dolmuş, lütfen tekrar giriş yapınız.');
      }
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
        ...options.headers,
      },
    });

    if (response.status === 401) {
      console.log('401 hatası alındı, token yenileme deneniyor...');
      const newToken = await this.refreshAccessToken();
      if (newToken) {
        // Retry the request with the new token
        return await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`,
            ...options.headers,
          },
        });
      } else {
        await this.clearToken();
        throw new Error('Oturum süresi dolmuş, lütfen tekrar giriş yapınız.');
      }
    }

    return response;
  }

  /**
   * @description Gets the user's profile information.
   * @returns { Promise<{ success: boolean, data?: any, error?: string }> }
   */
  async getProfile() {
    try {
      const response = await this._authenticatedFetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROFILE.ME}`, {
        method: 'GET',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return { success: true, data: data.data };
      } else {
        let errorMessage = data.message || 'Profil bilgileri alınamadı';
        if (response.status === 403) {
          errorMessage = 'Bu işlem için yetkiniz yok';
        } else if (response.status >= 500) {
          errorMessage = 'Sunucu hatası. Lütfen daha sonra tekrar deneyiniz.';
        }

        return { success: false, error: errorMessage };
      }
    } catch (error) {
      if (error.message.includes('Oturum süresi dolmuş')) {
        return { success: false, error: error.message };
      }

      console.error('Profile hatası:', error);

      if (error.name === 'TypeError' && error.message.includes('Network')) {
        return { success: false, error: 'İnternet bağlantısı hatası' };
      }

      return { success: false, error: 'Beklenmeyen bir hata oluştu' };
    }
  }

  /**
   * @description Gets the user's statistics.
   * @returns { Promise<{ success: boolean, data?: any, error?: string }> }
   */
  async getStats() {
    try {
      const response = await this._authenticatedFetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROFILE.STATS}`, {
        method: 'GET',
      });
      const data = await response.json();

      if (response.ok) {
        return { success: true, data: data.data };
      } else {
        let errorMessage = data.message || 'Profil istatistikleri alınamadı';

        if (response.status === 403) {
          errorMessage = 'Bu işlem için yetkiniz yok';
        } else if (response.status >= 500) {
          errorMessage = 'Sunucu hatası. Lütfen daha sonra tekrar deneyiniz.';
        }

        return { success: false, error: errorMessage };
      }
    } catch (error) {
      if (error.message.includes('Oturum süresi dolmuş')) {
        return { success: false, error: error.message };
      }

      console.error('Profile istatistik hatası:', error);

      if (error.name === 'TypeError' && error.message.includes('Network')) {
        return { success: false, error: 'İnternet bağlantısı hatası' };
      }

      return { success: false, error: 'Beklenmeyen bir hata oluştu' };
    }
  }

  /**
   * @description Updates user profile information.
   * @param { Object } profileData - The profile data to update.
   * @returns { Promise<Object> } Response object with success status and data or error message.
   */
  async updateProfile(profileData) {
    try {
      const response = await this._authenticatedFetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROFILE.UPDATE}`, {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data: data.data };
      } else {
        let errorMessage = data.message || 'Profil güncellenemedi';

        if (errorMessage.includes("No changes detected")) {
          errorMessage = "Herhangi bir değişiklik bulunmadığı için işlem iptal edildi."
        } else if (errorMessage.includes("username is already taken")) {
          errorMessage = "Bu kullanıcı adı zaten kullanımda. Lütfen farklı bir kullanıcı adı seçiniz."
        }

        if (response.status === 403) {
          errorMessage = 'Bu işlem için yetkiniz yok';
        } else if (response.status === 429) {
          errorMessage = 'Çok fazla deneme yaptınız, lütfen daha sonra tekrar deneyiniz.';
        } else if (response.status >= 500) {
          errorMessage = 'Sunucu hatası. Lütfen daha sonra tekrar deneyiniz.';
        }

        return { success: false, error: errorMessage };
      }
    } catch (error) {
      if (error.message.includes('Oturum süresi dolmuş')) {
        return { success: false, error: error.message };
      }

      console.error('Profil güncelleme hatası:', error);

      if (error.name === 'TypeError' && error.message.includes('Network')) {
        return { success: false, error: 'İnternet bağlantısı hatası' };
      }

      return { success: false, error: 'Beklenmeyen bir hata oluştu' };
    }
  }

  /**
   * @description Changes user password.
   * @param { Object } passwordData - The password change data.
   * @returns { Promise<Object> } Response object with success status and message or error.
   */
  async changePassword(passwordData) {
    try {
      const response = await this._authenticatedFetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROFILE.CHANGE_PASSWORD}`, {
        method: 'PUT',
        body: JSON.stringify(passwordData),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, message: data.message };
      } else {
        let errorMessage = data.message || 'Şifre değiştirilemedi';

        if (errorMessage.includes("Current password is incorrect"))
          errorMessage = "Belirtilen mevcut şifre yanlış.";
        if (response.status === 403) {
          errorMessage = 'Bu işlem için yetkiniz yok';
        } else if (response.status >= 500) {
          errorMessage = 'Sunucu hatası. Lütfen daha sonra tekrar deneyiniz.';
        }

        return { success: false, error: errorMessage };
      }
    } catch (error) {
      if (error.message.includes('Oturum süresi dolmuş')) {
        return { success: false, error: error.message };
      }

      console.error('Şifre değiştirme hatası:', error);

      if (error.name === 'TypeError' && error.message.includes('Network')) {
        return { success: false, error: 'İnternet bağlantısı hatası' };
      }

      return { success: false, error: 'Beklenmeyen bir hata oluştu' };
    }
  }
}

export const authService = new AuthService();
