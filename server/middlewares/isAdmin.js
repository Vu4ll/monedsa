const express = require("express");
const User = require("../models/user");
const locale = require("../locales/en.json");

/**
 * @param { express.Request } req 
 * @param { express.Response } res 
 * @param { express.NextFunction } next 
 * @description Middleware to check if the user is an admin.
 */
module.exports = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || user.role !== "admin") {
            return res.status(403).json({
                status: res.statusCode,
                success: false,
                message: locale.auth.fail.adminRequired
            });
        }

        next();
    } catch (error) {
        console.error(`Admin check error: ${error}`);
        return res.status(500).json({
            status: res.statusCode,
            success: false,
            message: locale.auth.fail.serverError,
        });
    }
}