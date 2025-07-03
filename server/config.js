require("dotenv").config();

module.exports = {
    env: {
        PORT: process.env.PORT || 3000,
        JWT_EXPIRATION: process.env.JWT_EXPIRATION || "7d",
    },

    emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    usernameRegex: /^[a-z0-9_.]{2,16}$/,
    passwordRegex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
};