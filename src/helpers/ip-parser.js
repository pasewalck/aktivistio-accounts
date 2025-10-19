/* 
 * This file is part of "Aktivistio Accounts".
 *
 * The project "Aktivistio Accounts" implements an account system and 
 * management platform combined with an OAuth 2.0 Authorization Server.
 *
 * "Aktivistio Accounts" is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * "Aktivistio Accounts" is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with "Aktivistio Accounts". If not, see https://www.gnu.org/licenses/.
 *
 * Copyright (C) 2025 Jana
 */
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
