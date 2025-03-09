import sharedRenderer from "./shared.renderer.js";

/**
 * @typedef {import("express").Request} Request
 */

/**
 * @typedef {import("express").Response} Response
 */

export default {
    /**
     * @description Renders the consent page for login authorization.
     * Displays the consent form to the user, allowing them to authorize the requested action.
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     * @param {string} uid - The unique identifier for the interaction session.
     * @param {string} clientId - The ID of the client requesting authorization.
     */
    consent: (req, res, uid, clientId) => {
        return res.render('cards/consent', {
            title: res.__('Authorize'),
            clientId,
            urls: {
                action: `/interaction/${uid}/confirm/`,
                abort: `/interaction/${uid}/abort/`
            }
        });
    },

    /**
     * @description Renders the logout page.
     * Displays the logout confirmation form to the user, allowing them to confirm their logout action.
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     * @param {string} secret - The secret associated with the session to be logged out.
     * @param {string} clientId - The ID of the client initiating the logout.
     */
    logout: (req, res, secret, clientId) => {
        return res.render('cards/logout', {
            title: res.__('Logout'),
            secret,
            clientId,
        });
    },
};
