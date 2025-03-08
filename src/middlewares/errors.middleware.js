import logger from "../helpers/logger.js"
import sharedRenderer from "../renderers/shared.renderer.js"

/**
 * @description middleware for error rendering
 * @param {import("express").ErrorRequestHandler} [err] // I am unsure if ErrorRequestHandler is correct here
 * @param {import("express").Request} [req]
 * @param {import("express").Response} [res]
 * @param {import("express").NextFunction} [next]
 */
const errorMiddleware = (err, req, res, next) => {
    logger.error(err)

    sharedRenderer.error(res,err)
}
export default errorMiddleware
  