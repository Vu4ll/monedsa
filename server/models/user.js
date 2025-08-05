const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    firebaseUid: { type: String, unique: true, sparse: true },
    isGoogleUser: { type: Boolean, default: false },
    password: { type: String, required: function () { return !this.isGoogleUser } },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);