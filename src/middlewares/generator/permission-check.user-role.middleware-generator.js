/**
 * @description generate middleware to be used to check for certain permission
 * @param {CallableFunction} [checkPermission]
 */
export function generateCheckUserPersmission (checkPermission) {
  /**
   * @description middleware 
   * @param {import("express").Request} [req]
   * @param {import("express").Response} [res]
   * @param {import("express").NextFunction} [next]
   */
  return (req,res,next) => {
    if(!checkPermission(req.account.role,permission))
      throw Error("Missing permissions for invite generation")
    next();
  }

}