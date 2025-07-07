require("dotenv").config();

module.exports = {
    env: {
        PORT: process.env.PORT || 3000,
        JWT_EXPIRATION: process.env.JWT_EXPIRATION || "15m",
        JWT_REFRESH_EXPIRATION: process.env.JWT_REFRESH_EXPIRATION || "14d",
    },

    emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    usernameRegex: /^[a-z0-9_.]{2,16}$/,
    passwordRegex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
};