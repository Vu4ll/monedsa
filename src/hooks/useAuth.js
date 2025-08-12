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
                console.log('Token not found user must be logged in');
                setIsAuthenticated(false);
                return;
            }

            if (authService.isTokenValid()) {
                console.log('Token valid');
                setIsAuthenticated(true);
                return;
            }

            if (!authService.getRefreshToken()) {
                console.log('Refresh token not found user must be logged in');
                setIsAuthenticated(false);
                return;
            }

            console.log('Access token is invalid, trying to refresh...');
            const newToken = await authService.refreshAccessToken();

            if (newToken) {
                console.log('Access token refreshed successfully');
                setIsAuthenticated(true);
            } else {
                console.log('Access token can not be refreshed, user must be logged in');
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
                console.log('Refresh token not found, logging out user');
                setIsAuthenticated(false);
                return;
            }

            console.log('Access token is expired, trying to refresh...');
            const newToken = await authService.refreshAccessToken();
            if (!newToken) {
                console.log('Access token can not be refreshed, logging out user');
                setIsAuthenticated(false);
            } else {
                console.log('Access token refreshed successfully');
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
            console.log('User logged out successfully');
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
