const express = require("express");
const router = express.Router();

const { badRequest, notFound, serverError, hexValidator } = require("../util/functions");
const { generalLimiter } = require("../util/rate-limits");
const verifyToken = require("../middlewares/verifyToken");
const locale = require("../locales/en.json");
const Category = require("../models/category");
const Transaction = require("../models/transaction");
const mongoose = require("mongoose");

router.get("/list", verifyToken, async (req, res) => {
    const { type } = req.query;

    try {
        let filter = { userId: req.user.id };
        if (type && ["expense", "income"].includes(type)) filter.type = type;

        const categories = await Category.find(filter)
            .select("-__v")
            .sort({ name: 1 });

        const userCategoryIds = categories
            .map(cat => cat._id);
        const userCategoriesWithTransactions = await Transaction.distinct('category', {
            category: { $in: userCategoryIds },
            userId: req.user.id
        });

        const transformedData = categories.map(cat => {
            let isDeletable = true;

            isDeletable = !userCategoriesWithTransactions.some(id =>
                id.toString() === cat._id.toString()
            );

            return {
                id: cat._id,
                name: cat.name,
                color: cat.color,
                type: cat.type,
                isDeletable,
                userId: cat.userId || null,
                createdAt: cat.createdAt
            }
        });

        res.status(200).json({
            status: res.statusCode,
            success: true,
            message: locale.category.success.list.retrieved,
            count: transformedData.length,
            data: transformedData
        });
    } catch (error) {
        console.error(`Error listing categories: \n${error.message}`);
        serverError(res, locale.category.fail.list.serverError);
    }
});

router.post("/add", generalLimiter, verifyToken, async (req, res) => {
    if (!req.body) return badRequest(res, locale.body.empty);

    const { name, color, type } = req.body;
    if (!name) return badRequest(res, locale.category.fail.add.nameRequired);
    if (!type) return badRequest(res, locale.category.fail.add.typeRequired);
    if (color && !hexValidator(color))
        return badRequest(res, locale.category.fail.add.invalidColor);
    if (!["expense", "income"].includes(type))
        return badRequest(res, locale.category.fail.add.invalidType);

    try {
        const existingCategory = await Category.findOne({
            name, type, $or: [{ userId: req.user.id }]
        });

        if (existingCategory)
            return badRequest(res, locale.category.fail.add.nameExists);

        const newCategory = await Category.create({
            name, color, type, userId: req.user.id
        });

        res.status(201).json({
            status: res.statusCode,
            success: true,
            message: locale.category.success.add.added,
            data: {
                id: newCategory._id,
                name: newCategory.name,
                color: newCategory.color,
                type: newCategory.type,
                userId: newCategory.userId
            }
        });
    } catch (error) {
        console.error(`Error adding category: \n${error.message}`);
        serverError(res, locale.category.fail.add.serverError);
    }
});

router.put("/edit", verifyToken, (req, res) => {
    return badRequest(res, locale.category.fail.edit.idRequired);
});

router.put("/edit/:id", generalLimiter, verifyToken, async (req, res) => {
    const { id } = req.params;
    if (!id) return badRequest(res, locale.category.fail.edit.idRequired);

    if (!mongoose.Types.ObjectId.isValid(id))
        return badRequest(res, locale.category.fail.edit.invalidId);

    const { name, color, type } = req.body;
    if (!name && !color && !type) return badRequest(res, locale.category.fail.edit.noFieldsToUpdate);

    try {
        const category = await Category.findOne({
            _id: id, userId: req.user.id
        });
        if (!category) return notFound(res, locale.category.fail.edit.notFound);

        if (name && typeof name !== "string")
            return badRequest(res, locale.category.fail.edit.invalidName);
        if (color && !hexValidator(color))
            return badRequest(res, locale.category.fail.edit.invalidColor);
        if (type && !["expense", "income"].includes(type))
            return badRequest(res, locale.category.fail.edit.invalidType);

        if (name && name !== category.name) {
            const existingCategory = await Category.findOne({
                name, _id: { $ne: id },
                $or: [{ userId: req.user.id }]
            });

            if (existingCategory) return badRequest(res, locale.category.fail.edit.nameExists);
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (color) updateData.color = color;
        if (type) updateData.type = type;

        const updatedCategory = await Category.findByIdAndUpdate(id, updateData, { new: true });

        if (type && type !== category.type) {
            const updateResult = await Transaction.updateMany(
                { category: id, userId: req.user.id },
                { type: type }
            );

            console.log(`Category type changed from ${category.type} to ${type}. Updated ${updateResult.modifiedCount} transactions.`);
        }

        res.status(200).json({
            status: res.statusCode,
            success: true,
            message: locale.category.success.edit.updated,
            data: {
                id: updatedCategory._id,
                name: updatedCategory.name,
                color: updatedCategory.color,
                type: updatedCategory.type,
                userId: updatedCategory.userId,

                ...(type && type !== category.type && {
                    transactionUpdateInfo: {
                        previousType: category.type,
                        newType: type,
                        updatedTransactionCount: await Transaction.countDocuments({
                            category: id,
                            userId: req.user.id
                        })
                    }
                })
            }
        });
    } catch (error) {
        console.error(`Error editing category: \n${error.message}`);
        serverError(res, locale.category.fail.edit.serverError);
    }
});

router.delete("/delete/:id", generalLimiter, verifyToken, async (req, res) => {
    const { id } = req.params;
    if (!id) return badRequest(res, locale.category.fail.delete.idRequired);

    if (!mongoose.Types.ObjectId.isValid(id))
        return badRequest(res, locale.category.fail.delete.invalidId);

    try {
        const category = await Category.findOne({
            _id: id, userId: req.user.id
        });
        if (!category) return notFound(res, locale.category.fail.delete.notFound);

        const relatedTransactions = await Transaction.find({ category: id, userId: req.user.id })
            .sort({ createdAt: -1 });

        if (relatedTransactions.length > 0) {
            return res.status(400).json({
                status: res.statusCode,
                success: false,
                message: locale.category.fail.delete.isRelated,
                data: {
                    categoryInfo: {
                        id: category._id,
                        name: category.name,
                        color: category.color,
                        type: category.type
                    },
                    relatedTransactionsCount: relatedTransactions.length,
                    relatedTransactions: relatedTransactions.map(transaction => ({
                        id: transaction._id,
                        amount: transaction.amount,
                        type: transaction.type,
                        description: transaction.description,
                        createdAt: transaction.createdAt
                    }))
                }
            });
        }

        const deletedCategory = await Category.findOneAndDelete({
            _id: id, userId: req.user.id
        });

        res.status(200).json({
            status: res.statusCode,
            success: true,
            message: locale.category.success.delete.deleted,
            data: {
                id: deletedCategory._id,
                name: deletedCategory.name,
                color: deletedCategory.color,
                type: deletedCategory.type,
            }
        });
    } catch (error) {
        console.error(`Error deleting category: \n${error.message}`);
        serverError(res, locale.category.fail.delete.serverError);
    }
});

module.exports = router;