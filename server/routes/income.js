const express = require("express");
const router = express.Router();
require("dotenv").config();

const { badRequest, notFound, serverError } = require("../util/functions");
const verifyToken = require("../middlewares/verifyToken");
const locale = require("../locales/en.json");
const Income = require("../models/income");
const Category = require("../models/category");
const mongoose = require("mongoose");

router.get("/", async (req, res) => {
    res.json({ message: "Income API is working!" });
});

router.post("/add", verifyToken, async (req, res) => {
    if (!req.body) return badRequest(res, locale.body.empty);
});

module.exports = router;