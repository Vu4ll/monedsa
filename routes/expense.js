const express = require("express");
const router = express.Router();
require("dotenv").config();

const { badRequest, notFound, serverError } = require("../util/functions");
const verifyToken = require("../middlewares/verifyToken");
const locale = require("../locales/en.json");
const Expense = require("../models/expense");

router.get("/", async (req, res) => {
    res.json({ message: "Expense API is working!" });
});

router.post("/add", verifyToken, async (req, res) => {
    if (!req.body) return badRequest(res, locale.body.empty);

    const { amount, description } = req.body;

    if (!amount) return badRequest(res, locale.expense.fail.add.amountField);
    if (typeof amount !== "number" || amount <= 0)
        return badRequest(res, locale.expense.fail.add.amountInvalid);

    try {
        const newExpense = await Expense.create({
            userId: req.user.userId,
            amount,
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
                description: newExpense.description,
                createdAt: newExpense.createdAt
            }
        });
    } catch (error) {
        console.error(error);
        serverError(res, locale.expense.fail.add.serverError);
    }
});

router.get("/list", verifyToken, async (req, res) => {
    const data = await Expense.find({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .select("-__v");

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

    const deletedExpense = await Expense.findOneAndDelete({ _id: id, userId: req.user.id });
    if (!deletedExpense) return notFound(res, locale.expense.fail.delete.noData);

    res.status(200).json({
        status: res.statusCode,
        success: true,
        message: locale.expense.success.delete.deleted,
        data: deletedExpense
    });
});

// to do edit expense


module.exports = router;