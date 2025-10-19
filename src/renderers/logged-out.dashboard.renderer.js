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
 * along with "Aktivistio Accounts". If not, see <https://www.gnu.org/licenses/>.
 *
 * Copyright (C) 2025 Jana
 */
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
     * Renders the account details initialization page
     * @param {Response} res - The response object.
     * @param {Boolean} isRegister - Flag to indicate registration mode
     * @param {JSON} [formData] - Data to pre-fill the form (optional).
     * @param {JSON} [errors] - Any validation errors to display (optional).
     */
    initAccountPage: (res,isRegister, formData = {}, errors = {}) => {
        return res.render('pages/logged-out/init/details', {
            title: res.__('page.register.head_title'),
            formData: formData,
            recoveryToken: formData.recoveryToken ? formData.recoveryToken : generateRecoveryToken(),
            errors: errors,
            isRegister: isRegister
        });
    },

    /**
     * Renders the account consent initialization page
     * @param {Response} res - The response object.
     * @param {Boolean} isRegister - Flag to indicate registration mode
     * @param {JSON} [formData] - Data to pre-fill the form (optional).
     * @param {JSON} [errors] - Any validation errors to display (optional).
     */
    initAccountPageConsent: async (res, isRegister, formData = {}, errors = {}) => {
        return res.render('pages/logged-out/init/consent', {
            title: res.__('page.register.head_title'),
            formData: formData,
            // TODO: Handle consent text in a more robust way
            consents: await marked(readFileSync("configuration/consent.md").toString()),
            errors: errors,
            isRegister: isRegister
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
        return res.render('pages/logged-out/recovery/request', {
            title: res.__('page.request_invite.title'),
            errors: errors,
            formData: formData
        });
    },

    /**
     * @description Displays a page confirming that an email has been sent to the user     
     * @param {Response} res - The response object.
     */
    recoveryEmailSent: (res) => {
        return res.render('pages/shared/info', {
            title: res.__('page.title.recovery-email-sent'),
            paragraph: res.__('common.recovery_email.sent'),
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
        return res.render('pages/logged-out/request-invite', {
            title: res.__('page.request_invite.title'),
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
        return res.render('pages/logged-out/recovery/confirm', {
            title: res.__('page.title.recovery'),
            errors: errors,
            formData: formData,
        });
    },

    /**
     * @description Renders the password reset prompt page.
     * Displays the form for users to reset their password, including the confirmation code if provided.
     * @param {Response} res - The response object.
     * @param {string} actionToken - The actionToken string.
     * @param {JSON} [formData] - Data to pre-fill the form (optional).
     * @param {JSON} [errors] - Any validation errors to display (optional).
     */
    recoveryPasswordPrompt: (res, actionToken, formData = {}, errors = {}) => {
        return res.render('pages/logged-out/recovery/reset', {
            title: res.__('page.title.recovery'),
            errors: errors,
            formData: formData,
            actionToken: actionToken
        });
    },

};
    
