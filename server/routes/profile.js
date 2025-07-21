const express = require("express");
const router = express.Router();
const argon2 = require("argon2");
const mongoose = require("mongoose");

const { badRequest, notFound, serverError } = require("../util/functions");
const verifyToken = require("../middlewares/verifyToken");
const locale = require("../locales/en.json");
const User = require("../models/user");
const { emailRegex, usernameRegex, passwordRegex } = require("../config");

router.get("/", async (req, res) => {
    res.json({ message: "Profile API is working!" });
});

router.get("/me", verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password -__v");

        if (!user) return notFound(res, locale.profile.fail.userNotFound);

        res.status(200).json({
            status: res.statusCode,
            success: true,
            message: locale.profile.success.infoRetrieved,
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                name: user.name,
                role: user.role,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error(`Error retrieving profile: \n${error.message}`);
        serverError(res, locale.profile.fail.serverError);
    }
});

router.put("/update", verifyToken, async (req, res) => {
    if (!req.body) return badRequest(res, locale.body.empty);

    const { username, email, name } = req.body;

    if (!username && !email && !name)
        return badRequest(res, locale.profile.fail.noFieldsToUpdate);

    try {
        const user = await User.findById(req.user.id);
        if (!user) return notFound(res, locale.profile.fail.userNotFound);

        if (username && !usernameRegex.test(username))
            return badRequest(res, locale.profile.fail.invalidUsername);

        if (email && !emailRegex.test(email)) return badRequest(res, locale.profile.fail.invalidEmail);

        if (name && typeof name !== "string") return badRequest(res, locale.profile.fail.invalidName);

        if (username && username.trim().toLowerCase() !== user.username) {
            const existingUser = await User.findOne({
                username: username.trim().toLowerCase(),
                _id: { $ne: req.user.id }
            });

            if (existingUser) return badRequest(res, locale.profile.fail.usernameExists);
        }

        if (email && email.toLowerCase() !== user.email) {
            const existingUser = await User.findOne({
                email: email.toLowerCase(),
                _id: { $ne: req.user.id }
            });

            if (existingUser) return badRequest(res, locale.profile.fail.emailExists);
        }

        const updateData = {};
        if (username && username.trim().toLowerCase() !== user.username)
            updateData.username = username.trim().toLowerCase();

        if (email && email.toLowerCase() !== user.email)
            updateData.email = email.toLowerCase();

        if (name && name.trim() !== user.name) updateData.name = name.trim();

        if (Object.keys(updateData).length === 0)
            return badRequest(res, locale.profile.fail.noChanges);

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id, updateData, { new: true }
        ).select("-password -__v");

        res.status(200).json({
            status: res.statusCode,
            success: true,
            message: locale.profile.success.updated,
            data: {
                id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                name: updatedUser.name,
                role: updatedUser.role,
                createdAt: updatedUser.createdAt
            }
        });
    } catch (error) {
        console.error(`Error updating profile: \n${error.message}`);
        serverError(res, locale.profile.fail.serverError);
    }
});

router.put("/change-password", verifyToken, async (req, res) => {
    if (!req.body) return badRequest(res, locale.body.empty);

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword) return badRequest(res, locale.profile.fail.currentPasswordRequired);
    if (!newPassword) return badRequest(res, locale.profile.fail.newPasswordRequired);
    if (!passwordRegex.test(newPassword)) return badRequest(res, locale.profile.fail.weakPassword);

    try {
        const user = await User.findById(req.user.id);
        if (!user) return notFound(res, locale.profile.fail.userNotFound);

        const isCurrentPasswordValid = await argon2.verify(user.password, currentPassword);
        if (!isCurrentPasswordValid) return badRequest(res, locale.profile.fail.incorrectCurrentPassword);

        const isSamePassword = await argon2.verify(user.password, newPassword);
        if (isSamePassword) return badRequest(res, locale.profile.fail.samePassword);

        const hashedNewPassword = await argon2.hash(newPassword);
        await User.findByIdAndUpdate(req.user.id, { password: hashedNewPassword });

        res.status(200).json({
            status: res.statusCode,
            success: true,
            message: locale.profile.success.passwordChanged
        });
    } catch (error) {
        console.error(`Error changing password: \n${error.message}`);
        serverError(res, locale.profile.fail.serverError);
    }
});

router.get("/stats", verifyToken, async (req, res) => {
    try {
        const Transaction = require("../models/transaction");

        const [totalTransactions, expenseCount, incomeCount] = await Promise.all([
            Transaction.countDocuments({ userId: req.user.id }),
            Transaction.countDocuments({ userId: req.user.id, type: "expense" }),
            Transaction.countDocuments({ userId: req.user.id, type: "income" })
        ]);

        const expenseSum = await Transaction.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(req.user.id), type: "expense" } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        const incomeSum = await Transaction.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(req.user.id), type: "income" } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        const totalExpense = expenseSum[0]?.total || 0;
        const totalIncome = incomeSum[0]?.total || 0;
        const balance = totalIncome - totalExpense;

        res.status(200).json({
            status: res.statusCode,
            success: true,
            message: locale.profile.success.statsRetrieved,
            data: {
                transactions: {
                    total: totalTransactions,
                    expense: expenseCount,
                    income: incomeCount
                },
                summary: {
                    totalExpense,
                    totalIncome,
                    balance
                }
            }
        });
    } catch (error) {
        console.error(`Error retrieving stats: \n${error.message}`);
        serverError(res, locale.profile.fail.serverError);
    }
});

module.exports = router;