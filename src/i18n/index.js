import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as RNLocalize from "react-native-localize";

import en from "../locales/en.json";
import tr from "../locales/tr.json";
import nl from "../locales/nl.json";

const SUPPORTED_LANGUAGES = ["en", "tr", "nl"];
const DEFAULT_LANGUAGE = "en";

const LANGUAGE_DETECTOR = {
    type: "languageDetector",
    async: true,
    detect: async (callback) => {
        try {
            const savedLanguage = await AsyncStorage.getItem("language");
            if (savedLanguage) {
                callback(savedLanguage);
                return;
            }

            const deviceLocales = RNLocalize.getLocales();
            if (deviceLocales && deviceLocales.length > 0) {
                const deviceLang = deviceLocales[0].languageCode;
                if (SUPPORTED_LANGUAGES.includes(deviceLang)) {
                    callback(deviceLang);
                    return;
                }
            }

            callback(DEFAULT_LANGUAGE);
        } catch (error) {
            callback(DEFAULT_LANGUAGE);
        }
    },
    init: () => { },
    cacheUserLanguage: async (language) => {
        try {
            await AsyncStorage.setItem("language", language);
        } catch (error) {
            console.log("Error saving language", error);
        }
    },
};

const resources = {
    en: { translation: en },
    tr: { translation: tr },
    nl: { translation: nl },
};

i18n.use(LANGUAGE_DETECTOR)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: DEFAULT_LANGUAGE,
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;