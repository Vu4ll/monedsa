const express = require("express");
const router = express.Router();

router.use("/api/auth", require("./auth.js"));
router.use("/api/transaction", require("./transaction.js"));
router.use("/api/category", require("./category.js"));

module.exports = router;