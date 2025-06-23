require("dotenv").config();

module.exports = {
    env: {
        PORT: process.env.PORT || 3000,
    },

    emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    usernameRegex: /^[a-z0-9_.]{2,16}$/,
    passwordRegex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
};