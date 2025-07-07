const express = require("express");
const router = express.Router();
require("dotenv").config();

const { badRequest, notFound, serverError, getTransactionList } = require("../util/functions");
const verifyToken = require("../middlewares/verifyToken");
const locale = require("../locales/en.json");
const Transaction = require("../models/transaction");
const Category = require("../models/category");
const mongoose = require("mongoose");

router.get("/", async (req, res) => {
    res.json({ message: "Transaction API is working!" });
});

router.post("/add", verifyToken, async (req, res) => {
    if (!req.body) return badRequest(res, locale.body.empty);

    const { amount, description, category, type } = req.body;
    const getCategory = await Category.findOne({ name: category, type });

    if (!type) return badRequest(res, locale.transaction.fail.add.typeField);
    if (!["expense", "income"].includes(type))
        return badRequest(res, locale.transaction.fail.add.invalidType);
    if (!getCategory) return badRequest(res, locale.transaction.fail.add.categoryNotFound);
    if (!amount) return badRequest(res, locale.transaction.fail.add.amountField);
    if (typeof amount !== "number" || amount <= 0)
        return badRequest(res, locale.transaction.fail.add.invalidAmount);

    try {
        const newTransaction = await Transaction.create({
            userId: req.user.id,
            amount,
            category: getCategory._id,
            type,
            description: description || null,
        });

        res.status(201).json({
            status: res.statusCode,
            success: true,
            message: locale.transaction.success.add.added,
            data: {
                id: newTransaction._id,
                userId: newTransaction.userId,
                amount: newTransaction.amount,
                category: {
                    id: getCategory._id,
                    name: getCategory.name,
                    color: getCategory.color,
                },
                type,
                description: newTransaction.description,
                createdAt: newTransaction.createdAt
            }
        });
    } catch (error) {
        console.error(`Error adding expense: \n${error.message}`);
        serverError(res, locale.transaction.fail.add.serverError);
    }
});

router.get("/expenses", verifyToken, async (req, res) => {
    return await getTransactionList(req, res, "expense");
});

router.get("/incomes", verifyToken, async (req, res) => {
    return await getTransactionList(req, res, "income");
});

router.get("/list", verifyToken, async (req, res) => {
    return await getTransactionList(req, res);
});

router.delete("/delete", verifyToken, (req, res) => {
    return badRequest(res, locale.transaction.fail.delete.idRequired);
});

router.delete("/delete/:id", verifyToken, async (req, res) => {
    const { id } = req.params;
    if (!id) return badRequest(res, locale.transaction.fail.delete.idRequired);

    if (!mongoose.Types.ObjectId.isValid(id))
        return badRequest(res, locale.transaction.fail.delete.invalidId);

    const deletedExpense = await Transaction.findOneAndDelete({ _id: id, userId: req.user.id });
    if (!deletedExpense) return notFound(res, locale.transaction.fail.delete.noData);

    res.status(200).json({
        status: res.statusCode,
        success: true,
        message: locale.transaction.success.delete.deleted,
        data: {
            id: deletedExpense._id,
            userId: deletedExpense.userId,
            amount: deletedExpense.amount,
            type: deletedExpense.type,
            description: deletedExpense.description,
            category: deletedExpense.category,
            createdAt: deletedExpense.createdAt
        }
    });
});

router.put("/edit", verifyToken, (req, res) => {
    return badRequest(res, locale.transaction.fail.edit.idRequired);
});

router.put("/edit/:id", verifyToken, async (req, res) => {
    const { id } = req.params;
    if (!id) return badRequest(res, locale.transaction.fail.edit.idRequired);
    if (!req.body) return badRequest(res, locale.body.empty);

    if (!mongoose.Types.ObjectId.isValid(id))
        return badRequest(res, locale.transaction.fail.edit.invalidId);

    const { amount, description, category, type } = req.body;

    let getCategory = null;
    if (category) {
        getCategory = await Category.findOne({ name: category });
        if (!getCategory)
            return badRequest(res, locale.transaction.fail.add.categoryNotFound);
    }

    if (amount && (typeof amount !== "number" || amount <= 0))
        return badRequest(res, locale.transaction.fail.edit.amountInvalid);
    if (category && !getCategory)
        return badRequest(res, locale.transaction.fail.add.categoryNotFound);
    if (type && !["expense", "income"].includes(type))
        return badRequest(res, locale.transaction.fail.edit.invalidType);

    try {
        const updateData = {};
        if (amount) updateData.amount = amount;
        if (description !== undefined) updateData.description = description;
        if (type) updateData.type = type;
        if (getCategory) updateData.category = getCategory._id;

        const editedExpense = await Transaction.findOneAndUpdate(
            { _id: id, userId: req.user.id }, updateData, { new: true }
        );
        if (!editedExpense) return notFound(res, locale.transaction.fail.edit.noData);

        const populatedExpense = await Transaction.findById(editedExpense._id)
            .select("-__v").populate("category", ["name", "color"]);

        res.status(200).json({
            status: res.statusCode,
            success: true,
            message: locale.transaction.success.edit.edited,
            data: {
                id: populatedExpense._id,
                userId: populatedExpense.userId,
                amount: populatedExpense.amount,
                type: populatedExpense.type,
                description: populatedExpense.description,
                category: {
                    id: populatedExpense.category._id,
                    name: populatedExpense.category.name,
                    color: populatedExpense.category.color,
                },
                createdAt: populatedExpense.createdAt
            },
        });
    } catch (error) {
        console.error(`Error editing expense: \n${error.message}`);
        serverError(res, locale.transaction.fail.edit.serverError);
    }
});

router.get("/summary", verifyToken, async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.user.id });

        const summary = transactions.reduce((acc, curr) => {
            if (curr.type === "expense") {
                acc.totalExpense += curr.amount;
            } else if (curr.type === "income") {
                acc.totalIncome += curr.amount;
            }
            return acc;
        }, { totalExpense: 0, totalIncome: 0 });

        summary.balance = summary.totalIncome - summary.totalExpense;

        res.status(200).json({
            status: res.statusCode,
            success: true,
            message: locale.transaction.success.summary.retrieved,
            data: summary
        });
    } catch (error) {
        console.error(`Error getting summary: \n${error.message}`);
        serverError(res, locale.expense.fail.summary.serverError);
    }
});

module.exports = router;