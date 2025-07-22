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
