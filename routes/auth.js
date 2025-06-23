const express = require("express");
const router = express.Router();
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");

const config = require("../config");
const { emailRegex, usernameRegex, passwordRegex } = config;
const { badRequest } = require("../util/functions");
const User = require("../models/user.js");

router.post("/register", async (req, res) => {
    const { email, password, username, name } = req.body;

    if (!email) return badRequest(res, "email field are required.");

    if (!password) return badRequest(res, "password filed are required.");

    if (!username) return badRequest(res, "username filed are required.");

    if (!name) return badRequest(res, "name filed are required.");

    if (email && !emailRegex.test(email)) return badRequest(res, "Invalid email format.");

    if (username && !usernameRegex.test(username))
        return badRequest(res,
            "Username must be 2-16 characters long and can only contain lowercase letters, numbers, underscores, and periods.");


    if (password && !passwordRegex.test(password))
        return badRequest(res,
            "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one number.");


    const user = await User.findOne({ email: email });
    if (user) return badRequest(res, "This email is already registered.");

    const existingUsername = await User.findOne({ username: username });
    if (existingUsername) return badRequest(res, "This username is already taken.");

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
            message: "User registered successfully.",
            data: {
                id: newUser._id,
                email: newUser.email,
                username: newUser.username.toLowerCase(),
                name: newUser.name,
            }
        });
    } catch (error) {
        console.error(`Register error: \n${error.message}`);
        res.status(500).json({
            success: false,
            message: "An error occurred while registering the user."
        });
    }
});

router.post("/login", async (req, res) => {
    const { user, password } = req.body;

    if (!user) return badRequest(res, "Email or username (user field) are required.");

    if (!password) return badRequest(res, "password field are required.");

    const isMail = emailRegex.test(user);
    const query = isMail ? { email: user } : { username: user.toLowerCase() };
    const userData = await User.findOne(query);

    if (!userData) return badRequest(res, "User not found.");

    res.status(200).json({ message: "Test başarılı" })
});

module.exports = router;