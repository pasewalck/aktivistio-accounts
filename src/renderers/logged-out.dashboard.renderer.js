import sharedRenderer from "./shared.renderer.js";
import config from "../config.js";
import { generateRecoveryToken } from "../helpers/recovery-token-string.js";

/**
 * @typedef {import("express").Request} Request
 */

/**
 * @typedef {import("express").Response} Response
 */

export default {
    /**
     * @description shared renderer for register page
     * @param {Response} [res]
     * @param {Request} [req]
     * @param {string} [actionUrl]
     * @param {string} [loginUrl]
     * @param {string|undefined} [abortUrl]
     * @param {JSON} [formFields]
     */
    register: (req,res,actionUrl,loginUrl,abortUrl=undefined,errorMsg=undefined,data={}) => {
        return res.render('cards/register', {
            title: res.__('Register'),
            data: data,
            data: data.recoveryToken ? data.recoveryToken : generateRecoveryToken(),
            errorMsg: errorMsg
        });
    },
    /**
     * @description render function for recovery page
     * @param {Response} [res]
     * @param {Request} [req]
     * @param {string|undefined} [errorMsg]
     */
    recovery: (req,res,errorMsg=undefined) => {
        return res.render('cards/recovery/request', {
            title: res.__('Request Invite'),
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
            title: res.__('Request Invite'),
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
        title: res.__('Recovery'),
            errorMsg: errorMsg,
            confirmCode: confirmCode
          });
    },
}

