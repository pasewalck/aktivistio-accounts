import sharedRenderer from "./shared.renderer.js";
import config from "../config.js";
import { generateRecoveryToken } from "../helpers/recovery-token-string.js";
import { marked } from "marked";
import { readFileSync } from "fs";

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
        return res.render('cards/register/details', {
            title: res.__('Register'),
            formData: formData,
            recoveryToken: formData.recoveryToken ? formData.recoveryToken : generateRecoveryToken(),
            errors: errors
        });
    },
    /**
     * @description
     * @param {Response} [res]
     * @param {JSON} [errors]
     * @param {JSON} [formData]
     */
    registerConsent: async (res,formData={},errors={}) => {
        
        return res.render('cards/register/consent', {
            title: res.__('Register'),
            formData: formData,
            //Todo handle this in some other way
            consents: await marked(readFileSync("configuration/consent.md").toString()),
            errors: errors
        });
    },
    /**
     * @description render function for recovery page
     * @param {Response} [res]
     * @param {JSON} [errors]
     * @param {JSON} [formData]
     */
    recoveryRequest: (res,formData={},errors={}) => {
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
     * @description 
     * @param {Response} [res]
     * @param {JSON} [errors]
     * @param {JSON} [formData]
     */
    recoveryConfirmCode: (res,formData={},errors={}) => {
        return res.render('cards/recovery/confirm', {
            title: res.__('Recovery'),
            errors: errors,
            formData: formData,
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

