const express = require("express");
const router = express.Router();

const { badRequest, notFound, serverError, hexValidator } = require("../util/functions");
const verifyToken = require("../middlewares/verifyToken");
const isAdmin = require("../middlewares/isAdmin");
const locale = require("../locales/en.json");
const Category = require("../models/category");
const mongoose = require("mongoose");

router.get("/", async (req, res) => {
    res.json({ message: "Category API is working!" });
});

router.get("/list", verifyToken, async (req, res) => {
    const { type } = req.query;

    try {
        let filter = {
            $or: [{ isDefault: true }, { userId: req.user.id }]
        };

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
    if (!req.body) return badRequest(res, locale.body.empty);

    const { id } = req.params;
    if (!id) return badRequest(res, locale.category.fail.edit.idRequired);

    if (!mongoose.Types.ObjectId.isValid(id))
        return badRequest(res, locale.category.fail.edit.invalidId);

    const { name, color, type } = req.body;

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

// To do delete a category
// To do add a default category
// To do edit a default category
// To do delete a default category

module.exports = router;