/**
 * @description middleware for 
 * @param {import("express").Response} [res]
 * @param {import("express").Request} [req]
 * @param {import("express").NextFunction} [next]
 */
export function setNoCache(req,res, next) {
  /**
   * @todo Review whether this is enough?
   */
  res.set('cache-control', 'no-store');
  next();
}