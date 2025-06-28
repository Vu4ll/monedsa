const express = require("express");
const router = express.Router();
require("dotenv").config();

const { badRequest } = require("../util/functions");
const verifyToken = require("../middlewares/verifyToken");
const locale = require("../locales/en.json");
const Test = require("../models/test");

router.get("/check", verifyToken, async (req, res) => {
    res.status(200).json({ status: res.statusCode, success: true, message: "Token is valid", user: req.user });
});

router.post("/data", verifyToken, async (req, res) => {
    if (!req.body) return badRequest(res, locale.body.empty);
    const { name } = req.body;
    const result = await Test.create({ userId: req.user.userId, name });
    res.status(201).json({ status: res.statusCode, success: true, message: "Test created successfully", result });
});

router.get("/data", verifyToken, async (req, res) => {
    const data = await Test.find({ userId: req.user.userId });
    res.status(200).json({
        status: res.statusCode,
        success: true,
        message: "Data retrieved successfully",
        data
    });
});

router.delete("/data/:id", verifyToken, async (req, res) => {
    const { id } = req.params;
    if (!id) return res.status(400).json({
        status: res.statusCode,
        success: false, 
        message: "ID is required"
    });

    const result = await Test.findOneAndDelete({ _id: id, userId: req.user.userId });
    if (!result) return res.status(404).json({
        status: res.statusCode,
        success: false,
        message: "Data not found"
    });

    res.status(200).json({
        status: res.statusCode,
        success: true,
        message: "Data deleted successfully",
        result
    });
});

module.exports = router;