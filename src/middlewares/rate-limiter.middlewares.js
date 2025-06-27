import { RateLimiterMemory } from "rate-limiter-flexible";
import sharedRenderer from "../renderers/shared.renderer.js";

const loginRecoveryRateLimiterConfig = {
    points: 20,
    duration: 60 * 60,
    blockDuration: 60 * 60,
};

const registerInviteRequestRateLimiterConfig = {
    points: 200,
    duration: 60 * 60 * 2,
    blockDuration: 60 * 60 * 2,
};

const ipRateLimiterConfig = {
    points: 3000,
    duration: 60 * 60,
    blockDuration: 60 * 60,
};

const twoFactorLoginRateLimiterConfig = {
    points: 10,
    duration: 60 * 60,
    blockDuration: 60 * 60,
};

const loginRecoveryRateLimiter = new RateLimiterMemory(loginRecoveryRateLimiterConfig);
const registerInviteRequestRateLimiter = new RateLimiterMemory(registerInviteRequestRateLimiterConfig);
const ipRateLimiter = new RateLimiterMemory(ipRateLimiterConfig);
const twoFactorLoginRateLimiter = new RateLimiterMemory(twoFactorLoginRateLimiterConfig);

/**
 * @description Creates a rate limiter middleware.
 * @param {RateLimiterMemory} rateLimiter - The rate limiter instance.
 * @param {Function} keyGenerator - Function to generate a unique key for each request.
 * @param {string} customMessage - Custom message to return on rate limit rejection.
 * @returns {Function} Middleware function for rate limiting.
 */
const createRateLimiterMiddleware = (rateLimiter, keyGenerator, customMessage) => {
    return async (req, res, next) => {
        const key = keyGenerator(req);
        try {
            await rateLimiter.consume(key);
            next();
        } catch (rejRes) {
            if (rejRes instanceof Error) {
                throw rejRes;
            } else {
                sharedRenderer.rateLimiter(res, rejRes.msBeforeNext, customMessage);
            }
        }
    };
};

// Key generators
const loginRecoveryKeyGenerator = (req) => req.ip + req.body.username;
const registerInviteRequestKeyGenerator = (req) => req.ip;
const ipKeyGenerator = (req) => req.ip;
const twoFactorKeyGenerator = (req) => req.session?.twoFactorLogin?.accountId;

// Custom messages
const loginMessage = "Too many login attempts.";
const recoveryMessage = "Too many recovery attempts.";
const registerInviteRequestMessage = "You have exceeded the number of invite requests.";
const ipRateLimitMessage = "Too many requests from your IP address.";
const twoFactorLoginMessage = "Too many two-factor login attempts.";

// Middleware instances
const loginRateLimiterMiddleware = createRateLimiterMiddleware(loginRecoveryRateLimiter, loginRecoveryKeyGenerator, loginMessage);
const recoveryRateLimiterMiddleware = createRateLimiterMiddleware(loginRecoveryRateLimiter, loginRecoveryKeyGenerator, recoveryMessage);
const registerInviteRequestRateLimiterMiddleware = createRateLimiterMiddleware(registerInviteRequestRateLimiter, registerInviteRequestKeyGenerator, registerInviteRequestMessage);
const ipRateLimiterMiddleware = createRateLimiterMiddleware(ipRateLimiter, ipKeyGenerator, ipRateLimitMessage);
const twoFactorLoginRateLimiterMiddleware = createRateLimiterMiddleware(twoFactorLoginRateLimiter, twoFactorKeyGenerator, twoFactorLoginMessage);

export {
    loginRateLimiterMiddleware,
    recoveryRateLimiterMiddleware,
    registerInviteRequestRateLimiterMiddleware,
    ipRateLimiterMiddleware,
    twoFactorLoginRateLimiterMiddleware
};
