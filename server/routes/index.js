const express = require("express");
const router = express.Router();

router.use("/api/auth", require("./auth.js"));
router.use("/api/expense", require("./expense.js"));
router.use("/api/income", require("./income.js"));

module.exports = router;