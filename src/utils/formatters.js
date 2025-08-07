import i18n from '../i18n';
const currencyMap = { tr: 'TRY', en: 'USD', nl: 'EUR' };
const localeMap = { tr: 'tr-TR', en: 'en-US', nl: 'nl-NL' };

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

export const formatCurrency = (amount, lang) => {
  const language = lang || i18n.language || 'en';
  const currency = currencyMap[language] || 'USD';
  let formatted = new Intl.NumberFormat(language + '-' + language.toUpperCase(), {
    style: 'currency',
    currency,
    currencyDisplay: 'symbol'
  }).format(amount);

  if (currency === 'USD' && formatted.includes('US$'))
    formatted = formatted.replace('US$', '$');
  return formatted;
};
