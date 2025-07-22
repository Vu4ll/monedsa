const express = require("express");
const router = express.Router();

router.use("/api/auth", require("./auth.js"));
router.use("/api/transaction", require("./transaction.js"));
router.use("/api/category", require("./category.js"));
router.use("/api/profile", require("./profile.js"));
router.use("/api/support", require("./support.js"));

module.exports = router;