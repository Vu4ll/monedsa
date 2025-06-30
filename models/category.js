const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, trim: true, maxlength: 50, minlength: 1 },
    color: { type: String, default: "22DD4A", trim: true, maxlength: 6, minlength: 6 }
});

module.exports = mongoose.model("Category", CategorySchema);