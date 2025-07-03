const express = require("express");

module.exports = {
    /**
     * @description This function is used to send a 400 Bad Request response.
     * @param { express.Response } res 
     * @param { String } message 
     */
    badRequest: (res, message) => {
        res.status(400).json({
            status: res.statusCode,
            success: false,
            message: message
        });
    },

    /**
     * @description This function is used to send a 404 Not Found response.
     * @param { express.Response } res 
     * @param { String } message 
     */
    notFound: (res, message) => {
        res.status(404).json({
            status: res.statusCode,
            success: false,
            message: message
        });
    },

    /**
     * @description This function is used to send a 500 Internal Server Error response.
     * @param { express.Response } res 
     * @param { String } message 
     */
    serverError: (res, message) => {
        res.status(500).json({
            status: res.statusCode,
            success: false,
            message: message
        });
    }
}