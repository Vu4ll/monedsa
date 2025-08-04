const mongoose = require("mongoose");
const Category = require("../models/category");
const User = require("../models/user");
const locale = require("../locales/api.json");
require("dotenv").config();

const defaultCategoriesEn = [
    { name: "Food", color: "#FF6B6B", type: "expense" },
    { name: "Transport", color: "#4ECDC4", type: "expense" },
    { name: "Entertainment", color: "#45B7D1", type: "expense" },
    { name: "Shopping", color: "#96CEB4", type: "expense" },
    { name: "Health", color: "#FFB347", type: "expense" },
    { name: "Education", color: "#7D5FFF", type: "expense" },
    { name: "Bill", color: "#3C6382", type: "expense" },
    { name: "Gift", color: "#F8A5C2", type: "expense" },
    { name: "Salary", color: "#FECA57", type: "income" },
    { name: "Freelance", color: "#FF9FF3", type: "income" },
    { name: "Investment", color: "#54A0FF", type: "income" },
    { name: "Bonus", color: "#00B894", type: "income" },
    { name: "Refund", color: "#636e72", type: "income" }
];

const defaultCategoriesTr = [
    { name: "Yemek", color: "#FF6B6B", type: "expense" },
    { name: "Ulaşım", color: "#4ECDC4", type: "expense" },
    { name: "Eğlence", color: "#45B7D1", type: "expense" },
    { name: "Alışveriş", color: "#96CEB4", type: "expense" },
    { name: "Sağlık", color: "#FFB347", type: "expense" },
    { name: "Eğitim", color: "#7D5FFF", type: "expense" },
    { name: "Fatura", color: "#3C6382", type: "expense" },
    { name: "Hediye", color: "#F8A5C2", type: "expense" },
    { name: "Maaş", color: "#FECA57", type: "income" },
    { name: "Freelance", color: "#FF9FF3", type: "income" },
    { name: "Yatırım", color: "#54A0FF", type: "income" },
    { name: "Prim", color: "#00B894", type: "income" },
    { name: "İade", color: "#636e72", type: "income" }
];

async function seedCategoriesForUser(userId, language = "en") {
    let addedCount = 0;

    const categories = language === "tr" ? defaultCategoriesTr : defaultCategoriesEn;

    for (const cat of categories) {
        const existing = await Category.findOne({
            name: cat.name,
            type: cat.type,
            userId: userId
        });

        if (!existing) {
            await Category.create({
                ...cat,
                userId: userId
            });
            console.log(locale.categorySeed.success.createdUser
                .replace("{id}", userId).replace("{name}", cat.name).replace("{type}", cat.type));
            addedCount++;
        }
    }

    return addedCount;
}

async function seedCategories() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const users = await User.find({}, '_id username');

        if (users.length === 0) {
            console.log(locale.categorySeed.fail.noUsers);
            process.exit(0);
        }

        console.log(locale.categorySeed.success.creating.replace("{length}", users.length));

        for (const user of users) {
            const addedCount = await seedCategoriesForUser(user._id, "en"); // Varsayılan dil
            console.log(locale.categorySeed.success.added
                .replace("{count}", addedCount).replace("{username}", user.username));
        }

        console.log(locale.categorySeed.success.addedAll);
        process.exit(0);
    } catch (error) {
        console.error(locale.categorySeed.fail.seedError, error);
        process.exit(1);
    }
}

module.exports = {
    seedCategoriesForUser,
    seedCategories,
    defaultCategoriesEn,
    defaultCategoriesTr
};

async function seedCategoriesForAllUsers(language = "en") {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const users = await User.find({}, '_id username');

        if (users.length === 0) {
            console.log(`No users found for language: ${language}`);
            return;
        }

        console.log(`Creating ${language} categories for ${users.length} users...`);

        for (const user of users) {
            const addedCount = await seedCategoriesForUser(user._id, language);
            console.log(`Added ${addedCount} ${language} categories for user: ${user.username}`);
        }

        console.log(`${language} categories seeded successfully!`);
    } catch (error) {
        console.error(`Error seeding ${language} categories:`, error);
        throw error;
    }
}

if (require.main === module) {
    const args = process.argv.slice(2);
    const languageArg = args.find(arg => arg.startsWith('--lang='));
    const language = languageArg ? languageArg.split('=')[1] : 'en';

    if (!['en', 'tr'].includes(language)) {
        console.error('Invalid language. Use --lang=en or --lang=tr');
        process.exit(1);
    }

    console.log(`Starting category seeding with language: ${language}`);
    seedCategoriesForAllUsers(language);
}