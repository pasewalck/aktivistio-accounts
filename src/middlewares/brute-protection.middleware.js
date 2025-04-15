import { BruteForceBlockError } from "../models/errors.js"
import bruteProtectionServices from "../services/brute-protection.services.js"

/**
 * @description Middleware to handle brute force protection
 * @param {import("express").Request} req - The request object.
 * @param {import("express").Response} res - The response object.
 * @param {import("express").NextFunction} next - The next middleware function.
 */
async function bruteProtectionMiddleware(req, res, next) {
  const addressHash = await bruteProtectionServices.getAddressHash(req)
  const checkResult = await bruteProtectionServices.doCheck(addressHash)

  if(checkResult.isBlocked)
    throw new BruteForceBlockError(checkResult.blockUntil)

  req.bruteProtection = {
    addressHash: addressHash,
    fail: async (action, key) => {
      const failResult = await bruteProtectionServices.addFail(addressHash,action, key)
      return failResult
    }
  }

  next()
}

export default bruteProtectionMiddleware