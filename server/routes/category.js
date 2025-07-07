const express = require("express");
const router = express.Router();

const { badRequest, notFound, serverError, hexValidator } = require("../util/functions");
const verifyToken = require("../middlewares/verifyToken");
const isAdmin = require("../middlewares/isAdmin");
const locale = require("../locales/en.json");
const Category = require("../models/category");
const Transaction = require("../models/transaction");
const mongoose = require("mongoose");

router.get("/", async (req, res) => {
    res.json({ message: "Category API is working!" });
});

router.get("/list", verifyToken, async (req, res) => {
    const { type, default: showOnlyDefault } = req.query;

    try {
        let filter = {};
        if (showOnlyDefault === "true") filter.isDefault = true;
        else if (showOnlyDefault === "false") filter = { userId: req.user.id, isDefault: false };
        else filter.$or = [{ isDefault: true }, { userId: req.user.id }];

        if (type && ["expense", "income"].includes(type)) filter.type = type;

        const categories = await Category.find(filter)
            .select("-__v")
            .sort({ isDefault: -1, name: 1 });

        const transformedData = categories.map(cat => ({
            id: cat._id,
            name: cat.name,
            color: cat.color,
            type: cat.type,
            isDefault: cat.isDefault,
            userId: cat.userId || null,
            createdAt: cat.createdAt
        }));

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

router.post("/add", verifyToken, async (req, res) => {
    if (!req.body) return badRequest(res, locale.body.empty);

    const { name, color, type } = req.body;
    if (!name) return badRequest(res, locale.category.fail.add.nameRequired);
    if (!type) return badRequest(res, locale.category.fail.add.typeRequired);
    if (color && !hexValidator(color))
        return badRequest(res, locale.category.fail.add.invalidHexColor);
    if (!["expense", "income"].includes(type))
        return badRequest(res, locale.category.fail.add.invalidType);

    try {
        const existingCategory = await Category.findOne({
            name, type, $or: [{ isDefault: true }, { userId: req.user.id }]
        });

        if (existingCategory)
            return badRequest(res, locale.category.fail.add.nameExists);

        const newCategory = await Category.create({
            name, color, type, isDefault: false, userId: req.user.id
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
                isDefault: newCategory.isDefault,
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

router.put("/edit/:id", verifyToken, async (req, res) => {
    const { id } = req.params;
    if (!id) return badRequest(res, locale.category.fail.edit.idRequired);

    if (!mongoose.Types.ObjectId.isValid(id))
        return badRequest(res, locale.category.fail.edit.invalidId);

    const { name, color, type } = req.body;
    if (!name && !color && !type) return badRequest(res, locale.category.fail.edit.noFieldsToUpdate);

    try {
        const category = await Category.findOne({
            _id: id, userId: req.user.id, isDefault: false
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
                $or: [{ isDefault: true }, { userId: req.user.id }]
            });

            if (existingCategory) return badRequest(res, locale.category.fail.edit.nameExists);
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (color) updateData.color = color;
        if (type) updateData.type = type;

        const updatedCategory = await Category.findByIdAndUpdate(id, updateData, { new: true });

        res.status(200).json({
            status: res.statusCode,
            success: true,
            message: locale.category.success.edit.updated,
            data: {
                id: updatedCategory._id,
                name: updatedCategory.name,
                color: updatedCategory.color,
                type: updatedCategory.type,
                isDefault: updatedCategory.isDefault,
                userId: updatedCategory.userId
            }
        });
    } catch (error) {
        console.error(`Error editing category: \n${error.message}`);
        serverError(res, locale.category.fail.edit.serverError);
    }
});

router.delete("/delete/:id", verifyToken, async (req, res) => {
    const { id } = req.params;
    if (!id) return badRequest(res, locale.category.fail.delete.idRequired);

    if (!mongoose.Types.ObjectId.isValid(id))
        return badRequest(res, locale.category.fail.delete.invalidId);

    try {
        const category = await Category.findOne({
            _id: id, userId: req.user.id, isDefault: false
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
            _id: id, userId: req.user.id, isDefault: false
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
                isDefault: deletedCategory.isDefault
            }
        });
    } catch (error) {
        console.error(`Error deleting category: \n${error.message}`);
        serverError(res, locale.category.fail.delete.serverError);
    }
});

router.post("/admin/add", verifyToken, isAdmin, async (req, res) => {
    if (!req.body) return badRequest(res, locale.body.empty);

    const { name, color, type } = req.body;
    if (!name) return badRequest(res, locale.category.fail.add.nameRequired);
    if (!type) return badRequest(res, locale.category.fail.add.typeRequired);
    if (!["expense", "income"].includes(type))
        return badRequest(res, locale.category.fail.add.invalidType);

    try {
        const existingCategory = await Category.findOne({ name, isDefault: true });
        if (existingCategory) return badRequest(res, locale.category.fail.add.nameExists);

        const newCategory = await Category.create({
            name, color, type, isDefault: true, userId: null
        });

        res.status(201).json({
            status: res.statusCode,
            success: true,
            message: locale.category.success.admin.defaultAdded,
            data: {
                id: newCategory._id,
                name: newCategory.name,
                color: newCategory.color,
                type: newCategory.type,
                isDefault: newCategory.isDefault,
            }
        });
    } catch (error) {
        console.error(`Error adding default category: \n${error.message}`);
        serverError(res, locale.category.fail.admin.addError);
    }
});

router.put("/admin/edit/:id", verifyToken, isAdmin, async (req, res) => {
    if (!req.body) return badRequest(res, locale.body.empty);

    const { id } = req.params;
    if (!id) return badRequest(res, locale.category.fail.edit.idRequired);

    if (!mongoose.Types.ObjectId.isValid(id))
        return badRequest(res, locale.category.fail.edit.invalidId);

    const { name, color, type } = req.body;
    if (!name && !color && !type) return badRequest(res, locale.category.fail.edit.noFieldsToUpdate);

    try {
        const category = await Category.findOne({ _id: id, isDefault: true });
        if (!category) return badRequest(res, locale.category.fail.edit.notFound);

        if (name && typeof name !== "string")
            return badRequest(res, locale.category.fail.edit.invalidName);
        if (color && !hexValidator(color))
            return badRequest(res, locale.category.fail.edit.invalidColor);
        if (type && !["expense", "income"].includes(type))
            return badRequest(res, locale.category.fail.edit.invalidType);

        if (name && name !== category.name) {
            const existingCategory = await Category.findOne({
                name: name, _id: { $ne: id }, isDefault: true
            });
            if (existingCategory) return badRequest(res, locale.category.fail.edit.nameExists);
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (color) updateData.color = color;
        if (type) updateData.type = type;

        const updatedCategory = await Category.findByIdAndUpdate(
            id, updateData, { new: true }
        );

        res.status(200).json({
            status: res.statusCode,
            success: true,
            message: locale.category.success.admin.defaultUpdated,
            data: {
                id: updatedCategory._id,
                name: updatedCategory.name,
                color: updatedCategory.color,
                type: updatedCategory.type,
                isDefault: updatedCategory.isDefault
            }
        });
    } catch (error) {
        console.error(`Error editing default category: \n${error.message}`);
        serverError(res, locale.category.fail.admin.editError);
    }
});

router.delete("/admin/delete/:id", verifyToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    if (!id) return badRequest(res, locale.category.fail.delete.idRequired);

    if (!mongoose.Types.ObjectId.isValid(id))
        return badRequest(res, locale.category.fail.delete.invalidId);

    try {
        const category = await Category.findOne({
            _id: id, isDefault: true
        });
        if (!category) return notFound(res, locale.category.fail.delete.notFound);

        const relatedTransactions = await Transaction.find({ category: id })
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
            _id: id, isDefault: true
        });

        if (!deletedCategory)
            return notFound(res, locale.category.fail.delete.notFound);

        res.status(200).json({
            status: res.statusCode,
            success: true,
            message: locale.category.success.admin.defaultDeleted,
            data: {
                id: deletedCategory._id,
                name: deletedCategory.name,
                color: deletedCategory.color,
                type: deletedCategory.type
            }
        });
    } catch (error) {
        console.error(`Error deleting default category: \n${error.message}`);
        serverError(res, locale.category.fail.admin.deleteError);
    }
});

module.exports = router;