const express = require("express");
const router = express.Router();

router.use("/api/auth", require("./auth.js"));
router.use("/api/expense", require("./expense.js"));
router.use("/api/test", require("./test.js"));

module.exports = router;