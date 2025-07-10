const express = require("express");
const Transaction = require("../models/transaction");
const Category = require("../models/category");
const locale = require("../locales/en.json");

/**
 * @description This function is used to send a 400 Bad Request response.
 * @param { express.Response } res 
 * @param { String } message 
 */
const badRequest = (res, message) => {
    res.status(400).json({
        status: res.statusCode,
        success: false,
        message: message
    });
}

/**
 * @description This function is used to send a 404 Not Found response.
 * @param { express.Response } res 
 * @param { String } message 
 */
const notFound = (res, message) => {
    res.status(404).json({
        status: res.statusCode,
        success: false,
        message: message
    });
}

/**
 * @description This function is used to send a 500 Internal Server Error response.
 * @param { express.Response } res 
 * @param { String } message 
 */
const serverError = (res, message) => {
    res.status(500).json({
        status: res.statusCode,
        success: false,
        message: message
    });
}

/**
 * @description This function retrieves a list of transactions based on various filters.
 * @param { express.Request } req 
 * @param { express.Response } res 
 * @returns { Promise<void> }
 */
const getTransactionList = async (req, res, forceType = null) => {
    const { category, type, minAmount, maxAmount, startDate, endDate, sortBy, sortOrder } = req.query;

    let filter = { userId: req.user.id };

    if (category) {
        const categoryDoc = await Category.findOne({ name: category });
        if (categoryDoc) filter.category = categoryDoc._id;
    }

    const transactionType = forceType || type;
    if (transactionType && ["expense", "income"].includes(transactionType)) {
        filter.type = transactionType;
    }

    if (minAmount || maxAmount) {
        filter.amount = {};
        if (minAmount) filter.amount.$gte = parseFloat(minAmount);
        if (maxAmount) filter.amount.$lte = parseFloat(maxAmount);
    }

    if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    let sortOptions = { createdAt: -1 };
    if (sortBy) {
        const order = sortOrder === "asc" ? 1 : -1;
        if (sortBy === "amount") sortOptions = { amount: order };
        else if (sortBy === "date") sortOptions = { createdAt: order };
    }

    try {
        const data = await Transaction.find(filter)
            .sort(sortOptions)
            .select("-__v")
            .populate("category", ["name", "color"]);

        if (!data || data.length === 0)
            return notFound(res, locale.transaction.fail.list.noData);

        const summary = data.reduce((acc, curr) => {
            if (curr.type === "expense") acc.totalExpense += curr.amount;
            else if (curr.type === "income") acc.totalIncome += curr.amount;
            return acc;
        }, { totalExpense: 0, totalIncome: 0 });
        summary.balance = summary.totalIncome - summary.totalExpense;

        const transformedData = data.map(item => ({
            id: item._id,
            userId: item.userId,
            amount: item.amount,
            type: item.type,
            description: item.description,
            category: item.category ? {
                id: item.category._id,
                name: item.category.name,
                color: item.category.color,
            } : null,
            createdAt: item.createdAt
        }));

        res.status(200).json({
            status: res.statusCode,
            success: true,
            message: locale.transaction.success.list.dataRetrieved,
            count: transformedData.length,
            filters: { category, type: transactionType, minAmount, maxAmount, startDate, endDate, sortBy, sortOrder },
            summary: {
                totalExpense: summary.totalExpense,
                totalIncome: summary.totalIncome,
                balance: summary.balance
            },
            data: transformedData
        });
    } catch (error) {
        console.error(`Error listing transactions: \n${error.message}`);
        serverError(res, locale.transaction.fail.list.serverError);
    }
}

/**
 * @description This function validates a hex color code.
 * @param { String } hex 
 * @returns { Boolean }
 */
const hexValidator = (hex) => {
    return /^([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex);
}

module.exports = {
    badRequest,
    notFound,
    serverError,
    getTransactionList,
    hexValidator
}