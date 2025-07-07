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

CategorySchema.pre("findOneAndDelete", async () => {
    const Transaction = mongoose.model("Transaction");
    const categoryId = this.getQuery()._id;
    
    const relatedTransactions = await Transaction.findOne({ category: categoryId });
    if (relatedTransactions) {
        throw new Error("Bu kategori silinemez çünkü ilişkili işlemler bulunmaktadır.");
    }
});

CategorySchema.pre("deleteOne", async () => {
    const Transaction = mongoose.model("Transaction");
    const categoryId = this.getQuery()._id;
    
    const relatedTransactions = await Transaction.findOne({ category: categoryId });
    if (relatedTransactions) {
        throw new Error("Bu kategori silinemez çünkü ilişkili işlemler bulunmaktadır.");
    }
});

module.exports = mongoose.model("Category", CategorySchema);