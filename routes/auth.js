const express = require("express");
const router = express.Router();
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const config = require("../config");
const { emailRegex, usernameRegex, passwordRegex } = config;
const { badRequest, serverError } = require("../util/functions");
const User = require("../models/user");
const Token = require("../models/token");
const verifyToken = require("../middlewares/verifyToken");
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
            success: true,
            message: locale.register.success.message,
            data: {
                id: newUser._id,
                email: newUser.email,
                username: newUser.username.toLowerCase(),
                name: newUser.name,
            }
        });
    } catch (error) {
        console.error(`Register error: \n${error.message}`);
        return serverError(res, locale.register.fail.errorMessage);
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
            userId: userData._id,
            email: userData.email,
            username: userData.username.toLowerCase(),
        }, process.env.JWT_SECRET, { expiresIn: config.env.JWT_EXPIRATION });

        const expiresAt = new Date().setDate(new Date().getDate() + 7);
        await Token.create({ token, userId: userData._id, expiresAt });

        res.status(200).json({
            success: true,
            message: locale.login.success.message,
            data: {
                token,
                user: {
                    id: userData._id,
                    email: userData.email,
                    username: userData.username.toLowerCase(),
                    name: userData.name,
                }
            }
        });
    } catch (error) {
        console.error(`Login error: \n${error.message}`);
        return serverError(res, locale.login.fail.errorMessage);
    }
});

router.post("/logout", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: locale.logout.fail.noToken,
            });
        }

        const token = authHeader.substring(7);
        const tokenDoc = await Token.findOne({ token });
        if (!tokenDoc) {
            return res.status(401).json({
                success: false,
                message: locale.logout.fail.invalidToken,
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: locale.logout.fail.invalidToken,
            });
        }

        await Token.deleteOne({ token });

        res.status(200).json({
            success: true,
            message: locale.logout.success.message,
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            message: locale.logout.fail.invalidToken,
        });
    }
});

router.get("/check", verifyToken, async (req, res) => {
    res.status(200).json({ success: true, message: "Token is valid", user: req.user });
});

const Test = require("../models/test");
router.post("/data", verifyToken, async (req, res) => {
    if (!req.body) return badRequest(res, locale.body.empty);
    const { name } = req.body;
    const result = await Test.create({ userId: req.user.userId, name });
    res.status(201).json({ success: true, message: "Test created successfully", result });
});

router.get("/data", verifyToken, async (req, res) => {
    const data = await Test.find({ userId: req.user.userId });
    res.status(200).json({ success: true, message: "Data retrieved successfully", data });
});

module.exports = router;