import logger from "../helpers/logger.js";
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
    logger.error(err); // Log the error
    sharedRenderer.error(res, err); // Render an error response
};

export default errorMiddleware;