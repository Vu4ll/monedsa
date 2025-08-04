const jwt = require("jsonwebtoken");
require("dotenv").config();
const locale = require("../locales/api.json");

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

        const token = authHeader.substring(7).trim();

        // Token'ın boş veya undefined olup olmadığını kontrol et
        if (!token || token === 'null' || token === 'undefined') {
            return res.status(401).json({
                status: res.statusCode,
                success: false,
                message: locale.verifyToken.invalidToken,
            });
        }

        // JWT verification
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded || !decoded.id) {
            return res.status(401).json({
                status: res.statusCode,
                success: false,
                message: locale.verifyToken.invalidToken,
            });
        }

        req.user = decoded;
        next();
    } catch (error) {
        console.error(`Token verification error: ${error.name}: ${error.message}`);

        // Daha spesifik error handling
        if (error.name === 'JsonWebTokenError') {
            console.error('Malformed token received:', req.headers.authorization);
            return res.status(401).json({
                status: res.statusCode,
                success: false,
                message: locale.verifyToken.invalidToken,
            });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                status: res.statusCode,
                success: false,
                message: locale.verifyToken.tokenNotFound,
            });
        }

        return res.status(401).json({
            status: res.statusCode,
            success: false,
            message: locale.verifyToken.invalidToken,
        });
    }
}