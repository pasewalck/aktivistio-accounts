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
     * @param {JSON} [errors]
     * @param {JSON} [formData]
     */
    register: (res,formData={},errors={}) => {
        console.log(errors)
        return res.render('cards/register', {
            title: res.__('Register'),
            formData: formData,
            recoveryToken: formData.recoveryToken ? formData.recoveryToken : generateRecoveryToken(),
            errors: errors
        });
    },
    /**
     * @description render function for recovery page
     * @param {Response} [res]
     * @param {JSON} [errors]
     * @param {JSON} [formData]
     */
    recovery: (res,formData={},errors={}) => {
        return res.render('cards/recovery/request', {
            title: res.__('Request Invite'),
            errors: errors,
            formData: formData
        });
    },
    /**
     * @description render function for requesting an invite page
     * @param {Response} [res]
     * @param {JSON} [errors]
     * @param {JSON} [formData]
     */
    inviteRequest: (res,formData={},errors={}) => {
        return res.render('cards/request-invite', {
            title: res.__('Request Invite'),
            errors: errors,
            formData: formData,
            emailProviders: config.invitingMailProviders
        });
    },
    /**
     * @description render function for requesting an account recovery
     * @param {Response} [res]
     * @param {string|undefined} [confirmCode]
     * @param {JSON} [errors]
     * @param {JSON} [formData]
     */
    recoveryPasswordPrompt: (res,formData={},errors={}) => {
        return res.render('cards/recovery/reset', {
            title: res.__('Recovery'),
            errors: errors,
            formData: formData,
            confirmCode: formData?.confirmCode
        });
    },
}

