const fs = require("fs");
const path = require("path");

const getTranslations = (language) => {
    const supportedLanguages = ["en", "tr", "nl"];
    const selectedLang = supportedLanguages.includes(language) ? language : "en";

    try {
        const filePath = path.join(__dirname, `../locales/${selectedLang}.json`);
        const content = fs.readFileSync(filePath, "utf8");
        const translations = JSON.parse(content);

        const t = (key, interpolation = {}) => {
            const keys = key.split(".");
            let value = translations;

            for (const k of keys) {
                if (value && value[k]) {
                    value = value[k];
                } else {
                    return key;
                }
            }

            if (typeof value === 'string' && interpolation) {
                Object.keys(interpolation).forEach(key => {
                    value = value.replace(new RegExp(`{{${key}}}`, 'g'), interpolation[key]);
                });
            }

            return value;
        };

        return t;
    } catch (error) {
        console.error(`Error loading translations for ${selectedLang}:`, error);
        return (key) => key;
    }
};

module.exports = getTranslations;