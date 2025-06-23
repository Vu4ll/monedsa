const express = require("express");

module.exports = {
    /**
     * @param { express.Response } res 
     * @param { String } message 
     */
    badRequest: (res, message) => {
        res.status(400).json({
            success: false,
            message: message
        });
    }
}