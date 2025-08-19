const express = require("express");
const router = express.Router();
const { emailRegex } = require("../config");
const { generalLimiter } = require("../util/ratelimit");
const locale = require("../locales/api.json");
const getTranslations = require("../util/getTranslations");
const { issueMail, userIssueMail } = require("../util/mail");
require("dotenv").config();

router.post("/issue", generalLimiter, async (req, res) => {
    try {
        const { title, description, email, platform, version, timestamp, language } = req.body;
        
        if (!title || !description || !email) {
            return res.status(400).json({
                status: res.statusCode,
                success: false,
                message: locale.support.issue.fail.missingFields
            });
        }
        
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                status: res.statusCode,
                success: false,
                message: locale.support.issue.fail.invalidEmail
            });
        }
        
        const localeMap = { tr: 'tr-TR', en: 'en-US', nl: 'nl-NL' };
        const selectedLanguage = ["en", "tr", "nl"].includes(language) ? language : 'en';
        const t = getTranslations(selectedLanguage);

        await issueMail(t, title, description, email, platform, version, timestamp, localeMap[selectedLanguage]);
        await userIssueMail(t, title, description, email);

        res.status(200).json({
            status: res.statusCode,
            success: true,
            message: locale.support.issue.success.message
        });

    } catch (error) {
        console.error("Issue submission error:", error);
        res.status(500).json({
            status: res.statusCode,
            success: false,
            message: locale.support.issue.fail.sendError
        });
    }
});

module.exports = router;