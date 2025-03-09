import { doubleCsrf } from 'csrf-csrf';
import secretService from '../services/secret.service.js';
import { generateSecret } from '../helpers/generate-secrets.js';

// Retrieve or generate a CSRF secret
const secret = await secretService.getEntries("CSRF_SECRET", () => generateSecret(40), { lifeTime: 120, graceTime: 2 });

/**
 * @description Configuration for CSRF protection middleware.
 * @type {Object}
 */
const { doubleCsrfProtection } = doubleCsrf({
  getSecret: () => secret,
  getSessionIdentifier: (req) => "", // Use session ID for better identification
  cookieName: "__Host-psifi.x-csrf-token",
  cookieOptions: {
    sameSite: "strict",
    path: "/",
    maxAge: 24 * 60 * 60 * 1000 // set max age to 1 day
  },
  size: 64,
  ignoredMethods: ["GET", "HEAD", "OPTIONS"],
  getTokenFromRequest: (req) => req.body?._csrf,
  errorConfig: {
    statusCode: 403,
    message: "Invalid CSRF token.",
    code: "EBADCSRFTOKEN"
  }
});

/**
 * @description Middleware to apply CSRF protection to incoming requests.
 * @param {import("express").Request} req - The request object.
 * @param {import("express").Response} res - The response object.
 * @param {import("express").NextFunction} next - The next middleware function.
 */
const csrfProtection = (req, res, next) => {
  doubleCsrfProtection(req, res, () => {
    res.locals.csrfToken = req.csrfToken(); // Set CSRF token in response locals
    next();
  });
};

export default csrfProtection;
