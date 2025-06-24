const jwt = require("jsonwebtoken");
require("dotenv").config();
const Token = require("../models/token");

module.exports = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: "Access denied. No token provided."
            });
        }

        const token = authHeader.substring(7);

        const tokenDoc = await Token.findOne({ token });
        if (!tokenDoc) {
            return res.status(401).json({
                success: false,
                message: "Token not found or expired"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;
        req.tokenId = tokenDoc._id;
        next();

    } catch (error) {
        console.error(`Token verification error: ${error.message}`);
        res.status(401).json({
            success: false,
            message: "Invalid token"
        });
    }
}