import { hasPermission, Permission } from "../../models/roles.js";

/**
 * @description Generate middleware to check for a specific permission
 * @param {Permission} [permission] - The permission to check for
 * @returns {function} Middleware function
 */
export function generateCheckUserPermission(permission) {

  if (!permission) {
    return res.status(400).json({ error: "Permission not specified" });
  }

  /**
   * @description Middleware to check user permissions
   * @param {import("express").Request} req - The request object
   * @param {import("express").Response} res - The response object
   * @param {import("express").NextFunction} next - The next middleware function
   */
  return (req, res, next) => {

    if (!hasPermission(req.account.role, permission)) {
      return res.status(403).json({ error: "Missing permissions for this action" });
    }

    next();
  };
}
