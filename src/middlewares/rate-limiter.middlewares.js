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

const loginRecoveryRateLimiter = new RateLimiterMemory(loginRecoveryRateLimiterConfig);
const registerInviteRequestRateLimiter = new RateLimiterMemory(registerInviteRequestRateLimiterConfig);
const ipRateLimiter = new RateLimiterMemory(ipRateLimiterConfig);

/**
 * @description Creates a rate limiter middleware.
 * @param {RateLimiterMemory} rateLimiter - The rate limiter instance.
 * @param {Function} keyGenerator - Function to generate a unique key for each request.
 * @returns {Function} Middleware function for rate limiting.
 */
const createRateLimiterMiddleware = (rateLimiter, keyGenerator) => {
    return async (req, res, next) => {
        const key = keyGenerator(req);
        try {
            await rateLimiter.consume(key);
            next();
        } catch (rejRes) {
            if (rejRes instanceof Error) {
                throw rejRes;
            } else {
                sharedRenderer.rateLimiter(res, rejRes.msBeforeNext);
            }
        }
    };
};

/**
 * @description Key generator for login and recovery routes.
 * @param {Object} req - The request object.
 * @returns {string} Unique key for the request.
 */
const loginRecoveryKeyGenerator = (req) => req.ip + req.body.username;

/**
 * @description Key generator for register and invite request routes.
 * @param {Object} req - The request object.
 * @returns {string} Unique key for the request.
 */
const registerInviteRequestKeyGenerator = (req) => req.ip;

/**
 * @description Key generator for IP-based rate limiting.
 * @param {Object} req - The request object.
 * @returns {string} Unique key for the request.
 */
const ipKeyGenerator = (req) => req.ip;


const loginRecoveryRateLimiterMiddleware = createRateLimiterMiddleware(loginRecoveryRateLimiter, loginRecoveryKeyGenerator);
const registerInviteRequestRateLimiterMiddleware = createRateLimiterMiddleware(registerInviteRequestRateLimiter, registerInviteRequestKeyGenerator);
const ipRateLimiterMiddleware = createRateLimiterMiddleware(ipRateLimiter, ipKeyGenerator);

export {
    loginRecoveryRateLimiterMiddleware,
    registerInviteRequestRateLimiterMiddleware,
    ipRateLimiterMiddleware,
};
