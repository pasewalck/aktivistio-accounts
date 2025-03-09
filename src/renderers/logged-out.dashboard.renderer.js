import { generateRecoveryToken } from "../helpers/recovery-token-string.js";
import { marked } from "marked";
import { readFileSync } from "fs";
import env from "../helpers/env.js";

/**
 * @typedef {import("express").Request} Request
 */

/**
 * @typedef {import("express").Response} Response
 */

export default {

    /**
     * @description Renders the registration details page.
     * Displays the registration form along with any errors and pre-filled data.
     * Generates a recovery token if one is not provided.
     * @param {Response} res - The response object.
     * @param {JSON} [formData] - Data to pre-fill the form (optional).
     * @param {JSON} [errors] - Any validation errors to display (optional).
     */
    register: (res, formData = {}, errors = {}) => {
        return res.render('cards/register/details', {
            title: res.__('Register'),
            formData: formData,
            recoveryToken: formData.recoveryToken ? formData.recoveryToken : generateRecoveryToken(),
            errors: errors
        });
    },

    /**
     * @description Renders the registration consent page.
     * Displays the consent form along with any errors and pre-filled data.
     * Reads consent text from a Markdown file and converts it to HTML.
     * @param {Response} res - The response object.
     * @param {JSON} [formData] - Data to pre-fill the form (optional).
     * @param {JSON} [errors] - Any validation errors to display (optional).
     */
    registerConsent: async (res, formData = {}, errors = {}) => {
        return res.render('cards/register/consent', {
            title: res.__('Register'),
            formData: formData,
            // TODO: Handle consent text in a more robust way
            consents: await marked(readFileSync("configuration/consent.md").toString()),
            errors: errors
        });
    },

    /**
     * @description Renders the recovery request page.
     * Displays the form for users to request an account recovery.
     * @param {Response} res - The response object.
     * @param {JSON} [formData] - Data to pre-fill the form (optional).
     * @param {JSON} [errors] - Any validation errors to display (optional).
     */
    recoveryRequest: (res, formData = {}, errors = {}) => {
        return res.render('cards/recovery/request', {
            title: res.__('Request Invite'),
            errors: errors,
            formData: formData
        });
    },

    /**
     * @description Renders the invite request page.
     * Displays the form for users to request an invite, including a list of whitelisted email providers.
     * 
     * @param {Response} res - The response object.
     * @param {JSON} [formData] - Data to pre-fill the form (optional).
     * @param {JSON} [errors] - Any validation errors to display (optional).
     */
    inviteRequest: (res, formData = {}, errors = {}) => {
        return res.render('cards/request-invite', {
            title: res.__('Request Invite'),
            errors: errors,
            formData: formData,
            emailProviders: env.WHITELISTED_MAIL_PROVIDERS
        });
    },

    /**
     * @description Renders the recovery confirmation code page.
     * Displays the form for users to confirm their recovery code, along with any errors and pre-filled data.
     * @param {Response} res - The response object.
     * @param {JSON} [formData] - Data to pre-fill the form (optional).
     * @param {JSON} [errors] - Any validation errors to display (optional).
     */
    recoveryConfirmCode: (res, formData = {}, errors = {}) => {
        return res.render('cards/recovery/confirm', {
            title: res.__('Recovery'),
            errors: errors,
            formData: formData,
        });
    },

    /**
     * @description Renders the password reset prompt page.
     * Displays the form for users to reset their password, including the confirmation code if provided.
     * @param {Response} res - The response object.
     * @param {JSON} [formData] - Data to pre-fill the form (optional).
     * @param {JSON} [errors] - Any validation errors to display (optional).
     */
    recoveryPasswordPrompt: (res, formData = {}, errors = {}) => {
        return res.render('cards/recovery/reset', {
            title: res.__('Recovery'),
            errors: errors,
            formData: formData,
            confirmCode: formData?.confirmCode // Passes the confirmation code if available
        });
    },
    
};
    