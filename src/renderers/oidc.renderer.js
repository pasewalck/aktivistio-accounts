import i18n from 'i18n';
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
        title: i18n.__('Authorize'),
        clientId,
        urls: {action: `/interaction/${uid}/confirm/`,abort:`/interaction/${uid}/abort/`}
        });
    },
    /**
     * @description render function for login page
     * @param {Response} [res]
     * @param {Request} [req]
     * @param {string} [uid]
     * @param {string|undefined} [errorMsg]
     */
    login: (req,res,uid,errorMsg=undefined) => {
        sharedRenderer.login(req,res,`/interaction/${uid}/login/`,`/interaction/${uid}/register/`,`/interaction/${uid}/abort/`,errorMsg)
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
            title: i18n.__('Logout'),
            secret,
            clientId,
            urls: {action: `/oidc/session/end/confirm/`}
        });
    },
    /**
     * @description render function for register page
     * @param {Response} [res]
     * @param {Request} [req]
     * @param {String} [uid]
     * @param {String} [errorMsg=undefined]
     * @param {JSON} [formFields={}]
     */
    register: (req,res,uid,errorMsg=undefined,formFields={}) => {
        sharedRenderer.register(req,res,`/interaction/${uid}/register/`,`/interaction/${uid}/`,`/interaction/${uid}/abort/`,errorMsg,formFields)
    },
    /**
     * @description render function for login 2fa page on oidc
     * @param {Response} [res]
     * @param {Request} [req]
     * @param {String} [uid=undefined]
     * @param {String} [errorMsg={}]
     */
    twoFactorAuth: (req,res,loginToken,uid,errorMsg=undefined) => {
        sharedRenderer.twoFactorAuth(req,res,loginToken,`/interaction/${uid}/login`,`/interaction/${uid}/`,errorMsg)
    },
}