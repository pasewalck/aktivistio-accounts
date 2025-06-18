import logger from "../helpers/logger.js";
import { ClientError, InternalError } from "../models/errors.js";
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

    switch (true) {
        case err instanceof InternalError:
            console.error(err); // Log the internal error for debugging
            return sharedRenderer.error(res,res.__('An internal error occurred. Please try again later.'),err.statusCode); // Render an error response

        case err instanceof ClientError || err.constructor.name === "ForbiddenError":
            return sharedRenderer.error(res,res.__("An error occurred with the following message: %s",res.__(err.message)),err.statusCode); // Render an error response

        default:
            // Handle other types of errors not known
            logger.error(err); // Log the error
            return sharedRenderer.error(res,res.__('An unexpected error occurred.'),500); // Render an error response    
    }

};
export default errorMiddleware;