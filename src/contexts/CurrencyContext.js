import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n';

const CurrencyContext = createContext();
const currencyMap = { tr: 'TRY', en: 'USD', gb: 'GBP', nl: 'EUR' };

export const CurrencyProvider = ({ children }) => {
    const [currency, setCurrency] = useState('USD');
    const [isLoading, setIsLoading] = useState(true);

    const initializeCurrency = async () => {
        try {
            const savedCurrency = await AsyncStorage.getItem('currency');

            if (savedCurrency) {
                setCurrency(savedCurrency);
            } else {
                const currentLanguage = i18n.language || 'en';
                const defaultCurrency = currencyMap[currentLanguage] || 'USD';

                setCurrency(defaultCurrency);
                await AsyncStorage.setItem('currency', defaultCurrency);
            }
        } catch (error) {
            console.error('Currency initialization error:', error);
            setCurrency('USD');
        } finally {
            setIsLoading(false);
        }
    };

    const changeCurrency = async (newCurrency) => {
        try {
            setCurrency(newCurrency);
            await AsyncStorage.setItem('currency', newCurrency);
        } catch (error) {
            console.error('Currency change error:', error);
        }
    };

    const handleLanguageChange = async () => {
        const savedCurrency = await AsyncStorage.getItem('currency');
        if (!savedCurrency) {
            const currentLanguage = i18n.language || 'en';
            const defaultCurrency = currencyMap[currentLanguage] || 'USD';
            setCurrency(defaultCurrency);
            await AsyncStorage.setItem('currency', defaultCurrency);
        }
    };

    useEffect(() => {
        initializeCurrency();

        let unsubscribe = null;
        try {
            if (i18n && typeof i18n.on === 'function') {
                unsubscribe = i18n.on('languageChanged', handleLanguageChange);
            } else if (i18n && typeof i18n.addListener === 'function') {
                unsubscribe = i18n.addListener('languageChanged', handleLanguageChange);
            }
        } catch (error) {
            console.warn('Could not add i18n language change listener:', error);
        }

        return () => {
            try {
                if (typeof unsubscribe === 'function') {
                    unsubscribe();
                }
                else if (i18n && typeof i18n.removeListener === 'function') {
                    i18n.removeListener('languageChanged', handleLanguageChange);
                } else if (i18n && typeof i18n.off === 'function') {
                    i18n.off('languageChanged', handleLanguageChange);
                }
            } catch (error) {
                console.warn('Could not remove i18n language change listener:', error);
            }
        };
    }, []);

    const value = {
        currency,
        changeCurrency,
        isLoading,
        currencyMap
    };

    return (
        <CurrencyContext.Provider value={value}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    return context;
};