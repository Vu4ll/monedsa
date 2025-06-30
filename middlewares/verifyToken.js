const jwt = require("jsonwebtoken");
require("dotenv").config();
const locale = require("../locales/en.json");

module.exports = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                status: res.statusCode,
                success: false,
                message: locale.verifyToken.accessDenied,
            });
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error(`Token verification error: ${error.message}`);
        res.status(401).json({
            status: res.statusCode,
            success: false,
            message: locale.verifyToken.invalidToken,
        });
    }
}