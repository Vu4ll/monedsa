const express = require("express");
const router = express.Router();
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const config = require("../config");
const { emailRegex, usernameRegex, passwordRegex } = config;
const { badRequest, serverError } = require("../util/functions");
const User = require("../models/user");
const locale = require("../locales/en.json");

router.post("/register", async (req, res) => {
    if (!req.body) return badRequest(res, locale.body.empty);

    const { email, password, username, name } = req.body;

    if (!email) return badRequest(res, locale.register.fail.emailField);
    if (!password) return badRequest(res, locale.register.fail.passwordField);
    if (!username) return badRequest(res, locale.register.fail.usernameField);
    if (!name) return badRequest(res, locale.register.fail.nameField);

    if (email && !emailRegex.test(email)) return badRequest(res, locale.register.fail.invalidEmail);
    if (username && !usernameRegex.test(username)) return badRequest(res, locale.register.fail.invalidUsername);
    if (password && !passwordRegex.test(password)) return badRequest(res, locale.register.fail.invalidPassword);

    const user = await User.findOne({ email: email });
    if (user) return badRequest(res, locale.register.fail.existsEmail);

    const existingUsername = await User.findOne({ username: username });
    if (existingUsername) return badRequest(res, locale.register.fail.existsUsername);

    const hashedPassword = await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 2 ** 16,
        timeCost: 3,
        parallelism: 1
    });

    const newUser = await User.create({
        email,
        password: hashedPassword,
        username: username.toLowerCase(),
        name,
        createdAt: Date.now()
    });

    try {
        res.status(201).json({
            status: res.statusCode,
            success: true,
            message: locale.register.success.message,
            data: {
                id: newUser._id,
                email: newUser.email,
                username: newUser.username,
                name: newUser.name,
            }
        });
    } catch (error) {
        console.error(`Register error: \n${error.message}`);
        return serverError(res, locale.register.fail.serverError);
    }
});

router.post("/login", async (req, res) => {
    if (!req.body) return badRequest(res, locale.body.empty);

    const { user, password } = req.body;

    if (!user) return badRequest(res, locale.login.fail.userField);

    if (!password) return badRequest(res, locale.login.fail.passwordField);

    const isMail = emailRegex.test(user);
    const query = isMail ? { email: user } : { username: user.toLowerCase() };
    const userData = await User.findOne(query);
    if (!userData) return badRequest(res, locale.login.fail.userNotFound);

    try {
        const isValidPassword = await argon2.verify(userData.password, password);

        if (!isValidPassword) return badRequest(res, locale.login.fail.invalidPassword);

        const token = jwt.sign({
            id: userData._id,
            email: userData.email,
            username: userData.username,
        }, process.env.JWT_SECRET, { expiresIn: config.env.JWT_EXPIRATION });

        const refreshToken = jwt.sign({
            id: userData._id,
            type: "refresh"
        }, process.env.JWT_REFRESH_SECRET, { expiresIn: config.env.JWT_REFRESH_EXPIRATION });

        res.status(200).json({
            status: res.statusCode,
            success: true,
            message: locale.login.success.message,
            user: {
                id: userData._id,
                email: userData.email,
                username: userData.username,
                name: userData.name,
            },
            token,
            refreshToken,
        });
    } catch (error) {
        console.error(`Login error: \n${error.message}`);
        return serverError(res, locale.login.fail.serverError);
    }
});

router.post("/refresh", async (req, res) => {
    if (!req.body) return badRequest(res, locale.body.empty);

    const { refreshToken } = req.body;
    if (!refreshToken) return badRequest(res, locale.refresh.fail.refreshField);

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        if (decoded.type !== "refresh") return badRequest(res, locale.refresh.fail.invalidToken);

        const userData = await User.findById(decoded.id);
        if (!userData) return badRequest(res, locale.refresh.fail.userNotFound);

        const newToken = jwt.sign({
            id: userData._id,
            email: userData.email,
            username: userData.username,
        }, process.env.JWT_SECRET, { expiresIn: config.env.JWT_EXPIRATION });

        res.status(200).json({
            status: res.statusCode,
            success: true,
            message: locale.refresh.success.message,
            token: newToken,
        });
    } catch (error) {
        console.error(`Refresh token error: \n${error.message}`);
        return badRequest(res, locale.refresh.fail.expiredToken);
    }
});

router.post("/logout", async (req, res) => {
    try {
        res.status(200).json({
            status: res.statusCode,
            success: true,
            message: locale.logout.success.message,
        });
    } catch (error) {
        res.status(401).json({
            status: res.statusCode,
            success: false,
            message: locale.logout.fail.invalidToken,
        });
    }
});

module.exports = router;