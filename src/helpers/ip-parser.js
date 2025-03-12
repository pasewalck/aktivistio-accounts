import logger from './logger.js';

/**
 * @description Parses an IP Address from supplied request
 * @param {import("express").Request} req - The request to parse
 * @returns {String|null} The IP Address found or null if not found
 */
export function parseIP(req) {
    try {
        // Check for x-forwarded-for header and split it to get the first IP
        const ip = req.headers["x-forwarded-for"] 
            ? req.headers["x-forwarded-for"].split(',')[0].trim() 
            : req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;

        if (!ip) {
            logger.warn("Unable to obtain IP Address from request");
        }
        return ip || null; // Return null if no IP is found
    } catch (error) {
        logger.warn("Error while obtaining IP Address from request:", error);
        return null; // Return null in case of an error
    }
}