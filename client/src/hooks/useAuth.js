import { useState, useEffect } from 'react';
import { authService } from '../services';
import ms from "ms";

/**
 * @description Custom hook for managing authentication state.
 * This hook handles user authentication, token validation, and periodic token checks.
 */
export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        initializeAuth();

        const tokenCheckInterval = setInterval(() => {
            if (isAuthenticated) {
                checkTokenStatus();
            }
        }, ms("5m"));

        return () => clearInterval(tokenCheckInterval);
    }, [isAuthenticated]);

    /**
     * @description Initializes authentication state by checking token validity and refreshing if necessary.
     * @return { Promise<void> }
     */
    const initializeAuth = async () => {
        try {
            await authService.loadToken();

            if (!authService.getToken()) {
                console.log('Token bulunamadı, kullanıcı giriş yapmalı');
                setIsAuthenticated(false);
                return;
            }

            if (authService.isTokenValid()) {
                console.log('Token geçerli, kullanıcı otomatik giriş yapıyor');
                setIsAuthenticated(true);
                return;
            }

            if (!authService.getRefreshToken()) {
                console.log('Refresh token bulunamadı, kullanıcı giriş yapmalı');
                setIsAuthenticated(false);
                return;
            }

            console.log('Token geçersiz, refresh token ile yenileme deneniyor...');
            const newToken = await authService.refreshAccessToken();

            if (newToken) {
                console.log('Token başarıyla yenilendi');
                setIsAuthenticated(true);
            } else {
                console.log('Token yenilenemedi, kullanıcı giriş yapmalı');
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error('Auth initialization error:', error);
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * @description Checks the current token status and refreshes it if necessary.
     * @return { Promise<void> }
     */
    const checkTokenStatus = async () => {
        try {
            if (authService.isTokenValid()) {
                return;
            }

            if (!authService.getRefreshToken()) {
                console.log('Refresh token bulunamadı, kullanıcı çıkış yapılıyor');
                setIsAuthenticated(false);
                return;
            }

            console.log('Token süresi dolmuş, yenileme deneniyor...');
            const newToken = await authService.refreshAccessToken();
            if (!newToken) {
                console.log('Token yenilenemedi, kullanıcı çıkış yapılıyor');
                setIsAuthenticated(false);
            } else {
                console.log('Token başarıyla yenilendi (periodic check)');
            }
        } catch (error) {
            console.error('Token status check error:', error);
        }
    };

    /**
     * @description Logs in the user by setting the authentication state to true.
     * @return { void }
     */
    const login = () => {
        setIsAuthenticated(true);
    };

    /**
     * @description Logs out the user by clearing the authentication state and token.
     * @return { Promise<void> }
     */
    const logout = async () => {
        try {
            await authService.logout();
            setIsAuthenticated(false);
            console.log('Kullanıcı çıkış yaptı');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return {
        isAuthenticated,
        isLoading,
        login,
        logout,
        checkTokenStatus,
        initializeAuth
    };
};
