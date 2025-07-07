const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, maxlength: 50, minlength: 1 },
    color: { type: String, default: "22DD4A" },
    type: { type: String, required: true, enum: ["expense", "income"], default: "expense" },
    isDefault: { type: Boolean, default: false },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now }
});

CategorySchema.index({ name: 1, userId: 1, type: 1 }, { unique: true });

module.exports = mongoose.model("Category", CategorySchema);