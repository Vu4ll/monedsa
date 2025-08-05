const express = require("express");
const router = express.Router();
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const admin = require("firebase-admin");
require("dotenv").config();

const config = require("../config");
const { emailRegex, usernameRegex, passwordRegex } = config;
const { badRequest, serverError } = require("../util/functions");
const User = require("../models/user");
const locale = require("../locales/api.json");
const { seedCategoriesForUser } = require("../seeds/categorySeed");
const { authLimiter } = require("../util/rate-limits");

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
    });
}

router.post("/register", authLimiter, async (req, res) => {
    if (!req.body) return badRequest(res, locale.body.empty);

    const { email, password, username, name, language } = req.body;

    if (!email) return badRequest(res, locale.register.fail.emailField);
    if (!password) return badRequest(res, locale.register.fail.passwordField);
    if (!username) return badRequest(res, locale.register.fail.usernameField);
    if (!name) return badRequest(res, locale.register.fail.nameField);

    const userLanguage = language && ["en", "tr"].includes(language) ? language : "en";

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

        try {
            await seedCategoriesForUser(newUser._id, userLanguage);
            console.log(`Default categories (${userLanguage}) created for new user: ${newUser.username}`);
        } catch (categoryError) {
            console.error(`Error creating categories for user ${newUser.username}:`, categoryError);
        }
    } catch (error) {
        console.error(`Register error: \n${error.message}`);
        return serverError(res, locale.register.fail.serverError);
    }
});

router.post("/login", authLimiter, async (req, res) => {
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
        }, process.env.JWT_SECRET, {
            expiresIn: config.env.JWT_EXPIRATION,
            algorithm: 'HS256'
        });

        const refreshToken = jwt.sign({
            id: userData._id,
            type: "refresh"
        }, process.env.JWT_REFRESH_SECRET, {
            expiresIn: config.env.JWT_REFRESH_EXPIRATION,
            algorithm: 'HS256'
        });

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
        }, process.env.JWT_SECRET, {
            expiresIn: config.env.JWT_EXPIRATION,
            algorithm: 'HS256'
        });

        res.status(200).json({
            status: res.statusCode,
            success: true,
            message: locale.refresh.success.message,
            token: newToken,
        });
    } catch (error) {
        console.error(`Refresh token error: \n${error.message}`);

        if (error.name === 'JsonWebTokenError') {
            return badRequest(res, locale.refresh.fail.invalidToken);
        } else if (error.name === 'TokenExpiredError') {
            return badRequest(res, locale.refresh.fail.expiredToken);
        }

        return badRequest(res, locale.refresh.fail.expiredToken);
    }
});

router.post("/google", async (req, res) => {
    try {
        const { idToken, firebaseUid } = req.body;
        if (!idToken) return badRequest(res, locale.googleLogin.fail.noToken);

        const decodedToken = await admin.auth().verifyIdToken(idToken);

        if (!decodedToken || decodedToken.uid !== firebaseUid) {
            return badRequest(res, locale.googleLogin.fail.invalidToken);
        }

        const { email, name, firebase } = decodedToken;

        if (!email) return badRequest(res, locale.googleLogin.fail.email);

        let user = await User.findOne({
            $or: [{ email }, { firebaseUid }]
        });

        if (!user) {
            const username = email.split("@")[0].toLowerCase() + Math.floor(Math.random() * 1000);

            user = await User.create({
                email,
                name,
                username,
                firebaseUid,
                isGoogleUser: true,
                createdAt: Date.now()
            });

            try {
                await seedCategoriesForUser(user._id, "tr"); // temprorily set to Turkish
            } catch (error) {
                console.error(`Error creating categories for Google user:`, error);
            }
        } else if (!user.firebaseUid) {
            user.firebaseUid = firebaseUid;
            user.isGoogleUser = true;
            await user.save();
        }

        const token = jwt.sign({
            id: user._id,
            email: user.email,
            username: user.username
        }, process.env.JWT_SECRET, {
            expiresIn: config.env.JWT_EXPIRATION,
            algorithm: "HS256"
        });

        const refreshToken = jwt.sign({
            id: user._id,
            type: "refresh"
        }, process.env.JWT_REFRESH_SECRET, {
            expiresIn: config.env.JWT_REFRESH_EXPIRATION,
            algorithm: "HS256"
        });

        res.status(200).json({
            status: res.statusCode,
            success: true,
            message: locale.googleLogin.success.message,
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                name: user.name
            },
            token,
            refreshToken
        });
    } catch (error) {
        console.error(`Google OAuth error: ${error.message}`);
        return serverError(res, "Google ile giriş yapılamadı");
    }
});

module.exports = router;