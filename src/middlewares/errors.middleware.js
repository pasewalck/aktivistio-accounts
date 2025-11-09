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
 * Copyright (C) 2025 Jana Caroline Pasewalck
 */
import logger from "../helpers/logger.js";
import { ClientError, InternalError, UnexpectedClientError } from "../models/errors.js";
import sharedRenderer from "../renderers/shared.renderer.js";

/**
 * @description Middleware for handling errors in the application.
 * This middleware logs the error and renders an error response using a shared renderer.
 * @param {Error} err - The error object that was thrown.
 * @param {import("express").Request} req - The request object.
 * @param {import("express").Response} res - The response object.
 * @param {import("express").NextFunction} next - The next middleware function.
 */
const errorMiddleware = (err, req, res, next) => {
    if (err instanceof InternalError) {
        console.error(err); // Log the internal error for debugging
        return sharedRenderer.error(res, res.__('error.internal.generic'), err.statusCode);
    } else if (err instanceof UnexpectedClientError) {
        return sharedRenderer.error(
            res, 
            res.__('error.unexpected.with_message %s', (err.message)), 
            err.statusCode
        );
    } else if (err instanceof ClientError || err.constructor.name === "ForbiddenError") {
        return sharedRenderer.error(
            res, 
            res.__('error.client.with_message %s', (err.message)), 
            err.statusCode
        );
    } else {
        logger.error(err); // Log the error
        return sharedRenderer.error(res, res.__('error.unexpected.generic'), 500);
    }
}

export default errorMiddleware;
