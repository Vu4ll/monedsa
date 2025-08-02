const rateLimit = require("express-rate-limit");
const ms = require("ms");
const locale = require("../locales/en.json");

const authLimiter = rateLimit({
    windowMs: ms("15m"),
    max: 10,
    message: { success: false, message: locale.rateLimit }
});

const generalLimiter = rateLimit({
    windowMs: ms("1m"),
    max: 30,
    message: { success: false, message: locale.rateLimit }
});

module.exports = { authLimiter, generalLimiter };