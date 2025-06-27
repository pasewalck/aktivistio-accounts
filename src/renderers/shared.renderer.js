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
            title: res.__('Login'),
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
            title: res.__('Login'),
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
            title: res.__('Error'),
            error: error
        });
    },

    /**
     * @description Renders the rate limiter.
     * @param {Response} res - The response object.
     * @param {Number} retrySecs - The retry seconds to display.
     *  @param {string} messageKey - Custom message key for message to display.
     */
    rateLimiter: (res, msBeforeNext,messageKey) => {
        const retrySecs = Math.round(msBeforeNext / 1000) || 1;
        res.set('Retry-After', String(retrySecs));
        res.status(429).send(`${res.__(messageKey)} ${res.__("Retry in %s seconds.",retrySecs)}`);
    },
};
