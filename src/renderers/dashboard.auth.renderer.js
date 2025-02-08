import i18n from "i18n";

import sharedRenderer from "./shared.renderer.js";
import config from "../config.js";

/**
 * @typedef {import("express").Request} Request
 */

/**
 * @typedef {import("express").Response} Response
 */

export default {
    /**
     * @description render function for login on dashboard
     * @param {Response} [res]
     * @param {Request} [req]
     * @param {string|undefined} [errorMsg]
     */
    login: (req,res,errorMsg=undefined,formFields={}) => {
        sharedRenderer.login(req,res,`/login/`,`/register/`,undefined,errorMsg,formFields)
    },
    /**
     * @description render function for login 2fa page on dashboard
     * @param {Response} [res]
     * @param {Request} [req]
     * @param {string|undefined} [errorMsg]
     */
    twoFactorAuth: (req,res,loginToken,errorMsg=undefined) => {
        sharedRenderer.twoFactorAuth(req,res,loginToken,`/login/`,`/login/`,errorMsg)
    },
    /**
     * @description render function for register page on dashboard
     * @param {Response} [res]
     * @param {Request} [req]
     * @param {string|undefined} [errorMsg]
     * @param {JSON} [formFields]
     */
    register: (req,res,errorMsg=undefined,formFields={}) => {
        sharedRenderer.register(req,res,`/register/`,`/login/`,undefined,errorMsg,formFields)
    },
    /**
     * @description render function for recovery page
     * @param {Response} [res]
     * @param {Request} [req]
     * @param {string|undefined} [errorMsg]
     */
    recovery: (req,res,errorMsg=undefined) => {
        return res.render('cards/recovery/request', {
            title: i18n.__('Request Invite'),
            errorMsg: errorMsg
          });
    },
    /**
     * @description render function for requesting an invite page
     * @param {Response} [res]
     * @param {Request} [req]
     * @param {string|undefined} [errorMsg]
     */
    inviteRequest: (req,res,errorMsg=undefined) => {
        return res.render('cards/request-invite', {
            title: i18n.__('Request Invite'),
            errorMsg: errorMsg,
            emailProviders: config.invitingMailProviders
          });
    },
    /**
     * @description render function for requesting an account recovery
     * @param {Response} [res]
     * @param {Request} [req]
     * @param {string|undefined} [confirmCode]
     * @param {string|undefined} [errorMsg]
     */
    recoveryPasswordPrompt: (req,res,confirmCode=undefined,errorMsg=undefined) => {
        return res.render('cards/recovery/reset', {
        title: i18n.__('Recovery'),
            errorMsg: errorMsg,
            confirmCode: confirmCode
          });
    },
}

