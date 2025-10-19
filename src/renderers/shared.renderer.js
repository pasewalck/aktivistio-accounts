/* 
 * This file is part of "Aktivistio Accounts".
 *
 * The project "Aktivistio Accounts" implements an account system and 
 * management platform combined with an OAuth 2.0 Authorization Server.
 *
 * "Aktivistio Accounts" is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * "Aktivistio Accounts" is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with "Aktivistio Accounts". If not, see https://www.gnu.org/licenses/.
 *
 * Copyright (C) 2025 Jana
 */
/**
 * @typedef {import("express").Request} Request
 */

/**
 * @typedef {import("express").Response} Response
 */

export default {
    /**
     * @description Renders the two-factor authentication (2FA) page.
     * Displays the 2FA form to the user, allowing them to enter their authentication code.
     * @param {Response} res - The response object.
     * @param {JSON|undefined} [interactionDetails] - Details about the interaction (optional).
     * @param {string} loginToken - The token associated with the login session.
     * @param {JSON} [errors] - Any validation errors to display (optional).
     */
    twoFactorAuth: (res, interactionDetails = null, loginToken, errors = {}) => {
        return res.render('pages/shared/2fa', {
            title: res.__('page.title.login'),
            interactionDetails: interactionDetails,
            errors: errors,
            loginToken: loginToken
        });
    },

    /**
     * @description Renders the login page.
     * Displays the login form to the user, allowing them to enter their credentials.
     * @param {Response} res - The response object.
     * @param {JSON|undefined} [interactionDetails] - Details about the interaction (optional).
     * @param {JSON} [formData] - Data to pre-fill the form (optional).
     * @param {JSON} [errors] - Any validation errors to display (optional).
     */
    login: (res, interactionDetails = null, formData = {}, errors = {}) => {
        return res.render('pages/shared/login', {
            title: res.__('page.title.login'),
            interactionDetails: interactionDetails,
            formData: formData,
            errors: errors
        });
    },

    /**
     * @description Renders the error page.
     * Displays an error message to the user.
     * @param {Response} res - The response object.
     * @param {JSON} error - The error details to display.
     */
    error: (res, error) => {
        return res.render('pages/shared/error', {
            title: res.__('page.title.error'),
            error: error
        });
    },

    /**
     * @description Renders the rate limiter.
     * @param {Response} res - The response object.
     * @param {Number} msBeforeNext - The milliseconds before the next request is allowed.
     * @param {string} messageKey - Custom message key for the message to display.
     */
    rateLimiter: (res, msBeforeNext, messageKey) => {
        const retrySecs = Math.round(msBeforeNext / 1000) || 1;
        const retryHours = Math.floor(retrySecs / 3600);
        const remainingSecs = retrySecs % 3600;
        const retryMinutes = Math.floor(remainingSecs / 60);
        const finalSecs = remainingSecs % 60;

        res.set('Retry-After', String(retrySecs));
        res.status(429);

        let messageParts = [res.__(messageKey)];

        if (retryHours > 0) {
            messageParts.push(res.__("rate_limiter.retry.hours %s", retryHours));
        }
        else if (retryMinutes > 0) {
            messageParts.push(res.__("rate_limiter.retry.minutes %s", retryMinutes));
        }
        else if (finalSecs > 0 || (retryHours === 0 && retryMinutes === 0)) { // Show seconds if no hours or minutes
            messageParts.push(res.__("rate_limiter.retry.seconds %s", finalSecs));
        }

        const message = messageParts.join(' ');

        res.send(message);
    },
};
