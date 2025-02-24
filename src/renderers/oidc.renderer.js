import sharedRenderer from "./shared.renderer.js";

/**
 * @typedef {import("express").Request} Request
 */

/**
 * @typedef {import("express").Response} Response
 */

export default {
    /**
     * @description render function for consenting login
     * @param {Response} [res]
     * @param {Request} [req]
     * @param {string} [uid]
     * @param {string} [clientId]
     */
    consent: (req,res,uid,clientId) => {
        return res.render('cards/consent', {
        title: res.__('Authorize'),
        clientId,
        urls: {action: `/interaction/${uid}/confirm/`,abort:`/interaction/${uid}/abort/`}
        });
    },
    /**
     * @description render function for logout page
     * @param {Response} [res]
     * @param {Request} [req]
     * @param {string} [secret]
     * @param {string} [clientId]
     */
    logout: (req,res,secret,clientId) => {
        return res.render('cards/logout', {
            title: res.__('Logout'),
            secret,
            clientId,
            urls: {action: `/oidc/session/end/confirm/`}
        });
    },
}