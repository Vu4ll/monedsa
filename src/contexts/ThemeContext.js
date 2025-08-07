import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getColors } from '../constants';
import { useTranslation } from 'react-i18next';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const { t, i18n } = useTranslation();
    const systemColorScheme = useColorScheme();
    const [themeMode, setThemeMode] = useState('system'); // 'system', 'light', 'dark'

    const getCurrentTheme = () => {
        if (themeMode === 'system') {
            return systemColorScheme === 'dark';
        }
        return themeMode === 'dark';
    };

    const isDarkMode = getCurrentTheme();
    const colors = getColors(isDarkMode);

    useEffect(() => {
        loadThemeSettings();
    }, []);

    const loadThemeSettings = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('themeMode');
            if (savedTheme) {
                setThemeMode(savedTheme);
            }
        } catch (error) {
            console.error('Tema ayarları yüklenirken hata:', error);
        }
    };

    const changeTheme = async (newThemeMode) => {
        try {
            await AsyncStorage.setItem('themeMode', newThemeMode);
            setThemeMode(newThemeMode);
        } catch (error) {
            console.error('Tema ayarları kaydedilirken hata:', error);
        }
    };

    const getThemeDisplay = () => {
        switch (themeMode) {
            case 'light': return t("settingsScreen.theme.light");
            case 'dark': return t("settingsScreen.theme.dark");
            default: return t("settingsScreen.theme.system");
        }
    };

    const value = {
        themeMode,
        isDarkMode,
        colors,
        changeTheme,
        getThemeDisplay,
        systemColorScheme
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};
