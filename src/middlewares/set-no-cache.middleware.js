/**
 * @description Middleware to set HTTP headers that prevent caching of responses.
 * @param {import("express").Request} req - The request object.
 * @param {import("express").Response} res - The response object.
 * @param {import("express").NextFunction} next - The next middleware function.
 */
export function setNoCache(req, res, next) {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate'); // Ensure users see the latest data
  res.set('Pragma', 'no-cache'); // For HTTP/1.0 compatibility
  res.set('Expires', '0'); // Proxies
  next();
}