const fs = require("fs");
const path = require("path");

const loadTranslations = () => {
    const translations = {}
    const localesDir = path.join(__dirname, "../locales");

    fs.readdirSync(localesDir).forEach((file) => {
        if (file.endsWith(".json") && file !== "api.json") {
            const locale = file.replace(".json", "");
            const filePath = path.join(localesDir, file);
            const content = fs.readFileSync(filePath, "utf8");
            translations[locale] = JSON.parse(content);
        }
    })

    return translations;
}

const translations = loadTranslations();
const supportedLocales = Object.keys(translations);
const defaultLocale = "tr";

module.exports = function i18nMiddleware(req, res, next) {
    let locale = req.cookies.locale || req.query.lang || defaultLocale;

    if (!supportedLocales.includes(locale)) {
        locale = defaultLocale;
    }

    if (req.query.lang && supportedLocales.includes(req.query.lang)) {
        res.cookie("locale", req.query.lang, { maxAge: 365 * 24 * 60 * 60 * 1000 });
        locale = req.query.lang;

        if (req.query.redirect) {
            const redirectUrl = req.query.redirect || req.path;
            return res.redirect(redirectUrl);
        }
    }

    res.locals.t = (key) => {
        const keys = key.split(".");
        let value = translations[locale];

        for (const k of keys) {
            if (value && value[k]) {
                value = value[k];
            } else {
                return key;
            }
        }

        return value;
    }

    res.locals.currentLocale = locale;
    res.locals.supportedLocales = supportedLocales;
    res.locals.localeNames = {
        tr: "Türkçe",
        en: "English",
        nl: "Nederlands"
    };

    next();
}
