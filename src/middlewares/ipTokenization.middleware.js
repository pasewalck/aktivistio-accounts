import ipTokenizerService from "../services/ip-tokenizer.service.js";

/**
 * @description Middleware to tokenize an ip and store token in request.
 * @param {import("express").Request} req - The request object.
 * @param {import("express").Response} res - The response object.
 * @param {import("express").NextFunction} next - The next middleware function.
 */
async function ipTokenizationMiddleware(req, res, next) {
  
  req.uniqueToken = ipTokenizerService.tokenForIp(req.ip)
  console.log(req.uniqueToken)
  next();
  
}

export default ipTokenizationMiddleware
