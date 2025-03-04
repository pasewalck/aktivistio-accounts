import { hasPermission, Permission } from "../../models/roles.js";

/**
 * @description generate middleware to be used to check for certain permission
 * @param {Permission} [permission]
 */
export function generateCheckUserPersmission (permission) {
  /**
   * @description middleware 
   * @param {import("express").Request} [req]
   * @param {import("express").Response} [res]
   * @param {import("express").NextFunction} [next]
   */
  return (req,res,next) => {
    if(!hasPermission(req.account.role,permission))
      throw Error("Missing permissions for invite generation")
    next();
  }

}