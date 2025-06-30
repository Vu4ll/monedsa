const express = require("express");
const router = express.Router();
require("dotenv").config();

const { badRequest, notFound, serverError } = require("../util/functions");
const verifyToken = require("../middlewares/verifyToken");
const locale = require("../locales/en.json");
const Expense = require("../models/expense");
const Category = require("../models/category");
const mongoose = require("mongoose");

router.get("/", async (req, res) => {
    res.json({ message: "Expense API is working!" });
});

router.post("/add", verifyToken, async (req, res) => {
    if (!req.body) return badRequest(res, locale.body.empty);

    const { amount, description, category } = req.body;
    const getCategory = await Category.findOne({ name: category });

    if (!getCategory) return badRequest(res, locale.expense.fail.add.categoryNotFound);
    if (!amount) return badRequest(res, locale.expense.fail.add.amountField);
    if (typeof amount !== "number" || amount <= 0)
        return badRequest(res, locale.expense.fail.add.invalidAmount);

    try {
        const newExpense = await Expense.create({
            userId: req.user.userId,
            amount,
            category: getCategory._id,
            description: description || null,
        });

        res.status(201).json({
            status: res.statusCode,
            success: true,
            message: locale.expense.success.add.added,
            data: {
                _id: newExpense._id,
                userId: newExpense.userId,
                amount: newExpense.amount,
                category: {
                    _id: getCategory._id,
                    name: getCategory.name
                },
                description: newExpense.description,
                createdAt: newExpense.createdAt
            }
        });
    } catch (error) {
        console.error(`Error adding expense: \n${error.message}`);
        serverError(res, locale.expense.fail.add.serverError);
    }
});

router.get("/list", verifyToken, async (req, res) => {
    const data = await Expense.find({ userId: req.user.userId })
        .sort({ createdAt: -1 })
        .select("-__v")
        .populate("category", "name");

    if (!data || data.length === 0)
        return notFound(res, locale.expense.fail.list.noData);

    res.status(200).json({
        status: res.statusCode,
        success: true,
        message: locale.expense.success.list.dataRetrieved,
        data
    });
});

router.delete("/delete", verifyToken, (req, res) => {
    return badRequest(res, locale.expense.fail.delete.idRequired);
});

router.delete("/delete/:id", verifyToken, async (req, res) => {
    const { id } = req.params;
    if (!id) return badRequest(res, locale.expense.fail.delete.idRequired);

    if (!mongoose.Types.ObjectId.isValid(id))
        return badRequest(res, locale.expense.fail.delete.invalidId);

    const deletedExpense = await Expense.findOneAndDelete({ _id: id, userId: req.user.userId });
    if (!deletedExpense) return notFound(res, locale.expense.fail.delete.noData);

    res.status(200).json({
        status: res.statusCode,
        success: true,
        message: locale.expense.success.delete.deleted,
        data: deletedExpense
    });
});

router.put("/edit", verifyToken, (req, res) => {
    return badRequest(res, locale.expense.fail.edit.idRequired);
});

router.put("/edit/:id", verifyToken, async (req, res) => {
    const { id } = req.params;
    if (!id) return badRequest(res, locale.expense.fail.edit.idRequired);
    if (!req.body) return badRequest(res, locale.body.empty);

    if (!mongoose.Types.ObjectId.isValid(id))
        return badRequest(res, locale.expense.fail.edit.invalidId);

    const { amount, description, category } = req.body;
    const getCategory = await Category.findOne({ name: category });

    if (amount && (typeof amount !== "number" || amount <= 0))
        return badRequest(res, locale.expense.fail.edit.amountInvalid);
    if (category && !getCategory)
        return badRequest(res, locale.expense.fail.add.categoryNotFound);

    try {
        const editedExpense = await Expense.findOneAndUpdate(
            { _id: id, userId: req.user.userId },
            { amount, description, category: getCategory._id },
            { new: true }
        );
        const populatedExpense = await Expense.findById(editedExpense._id).populate("category", "name");

        res.status(200).json({
            status: res.statusCode,
            success: true,
            message: locale.expense.success.edit.edited,
            data: populatedExpense,
        });
    } catch (error) {
        console.error(`Error editing expense: \n${error.message}`);
        serverError(res, locale.expense.fail.edit.serverError);
    }
});

module.exports = router;