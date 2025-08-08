import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n';

const localeMap = { tr: 'tr-TR', en: 'en-US', nl: 'nl-NL' };
const currencySymbols = { USD: '$', GBP: '£', EUR: '€', TRY: '₺' };

export const formatDate = (dateString, lang) => {
  const language = lang || i18n.language || 'en';
  const locale = localeMap[language] || 'en-US';
  return new Date(dateString).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatCurrency = (amount, currency = 'USD', lang) => {
  const language = lang || i18n.language || 'en';
  const locale = localeMap[language] || 'en-US';

  try {
    let formatted = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      currencyDisplay: 'symbol'
    }).format(amount);

    if (currency === 'USD' && formatted.includes('US$')) {
      formatted = formatted.replace('US$', '$');
    }

    if (currency === 'TRY' && formatted.includes('TRY')) {
      formatted = formatted.replace(/TRY/, '₺');
    }

    return formatted;
  } catch (error) {
    const symbol = currencySymbols[currency] || currency;
    return `${symbol}${amount.toFixed(2)}`;
  }
};

export const formatCurrencyAsync = async (amount, lang) => {
  const language = lang || i18n.language || 'en';
  const currency = await AsyncStorage.getItem('currency') || 'USD';
  return formatCurrency(amount, currency, language);
};