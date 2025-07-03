const mongoose = require("mongoose");

const incomeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true, min: 0.01 },
    description: { type: String, trim: true, maxlength: 500 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Income", incomeSchema);