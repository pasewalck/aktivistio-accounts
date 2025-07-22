import assert from "assert";
import provider from "../helpers/oidc/provider.js";
import { matchedData, validationResult } from "express-validator";
import { setProviderSession } from "../helpers/oidc/session.js";
import sharedRenderer from "../renderers/shared.renderer.js";
import accountService from "../services/account.service.js";
import auditService from "../services/audit.service.js";
import { AuditActionType } from "../models/audit-action-types.js";
import { UnexpectedClientError } from "../models/errors.js";
import { extendUrl } from "../helpers/url.js";
import env from "../helpers/env.js";

/**
 * @typedef {import("express").Request} Request
 * Represents an HTTP request in Express.
 */

/**
 * @typedef {import("express").Response} Response
 * Represents an HTTP response in Express.
 */

/**
 * @description Attempts to retrieve interaction details for Request and Response if possible (one is found).
 * @param {Request} req - The HTTP request object.
 * @param {Response} res - The HTTP response object.
 * @returns {Promise<Object|undefined>} Return the interaction details or undefined.
 */
async function getInteractionDetailsNullable(req, res) {
    try {
        return await provider.interactionDetails(req, res);
    } catch (error) {
        return undefined; // Return undefined if there is an error retrieving interaction details
    }
}

/**
 * @description Handles the login process by finishing the interaction or setting the provider session and redirecting the user.
 * @param {Response} res - The HTTP response object.
 * @param {Request} req - The HTTP request object.
 * @param {Object} interactionDetails - The interaction details from the OIDC provider.
 * @param {String} accountId - The ID of the authenticated account.
 */
async function doLogin(res, req, interactionDetails, accountId) {
    auditService.appendAuditLog({id:accountId},AuditActionType.LOGIN_SUCCESS,req)
    if (interactionDetails) {
        // If interaction details are present, finish the interaction with the account ID
        await provider.interactionFinished(req, res, {
            login: {
                accountId: accountId,
            },
        }, { mergeWithLastSubmission: false });
    } else {
        // If no interaction details, set the provider session and redirect to the home page
        await setProviderSession(provider, req, res, { accountId: accountId });
        accountService.lastLogin.register(accountService.find.withId(accountId))
        res.redirect(extendUrl(env.BASE_URL));
    }
}

export default {
    /**
     * @description Controller for handling account login POST requests.
     * Validates the request data, double checks login credentials and processes the login attempt.
     * @param {Request} req - The HTTP request object.
     * @param {Response} res - The HTTP response object.
     */
    loginPost: async (req, res) => {
        // Retrieve interaction details, if available
        const interactionDetails = await getInteractionDetailsNullable(req, res);

        // Ensure the prompt is for login if interaction details are present
        if (interactionDetails) {
            assert.equal(interactionDetails.prompt.name, 'login');
        }

        // Validate the incoming request data
        const errors = await validationResult(req);
        const data = await matchedData(req);

        // If there are validation errors, render the login page with error messages
        if (!errors.isEmpty()) {
            auditService.appendAuditLog(accountService.find.withUsername(data.username),AuditActionType.LOGIN_FAIL,req)
            sharedRenderer.login(res, interactionDetails, data, errors.mapped());
        } else {
            // Check the provided username and password against the account service
            let account = await accountService.checkLogin(data.username, data.password);

            if (account) {
                // If the account has two-factor authentication enabled
                if (accountService.twoFactorAuth.get(account) != null) {
                    // Generate a unique token for the two-factor login session
                    let token = crypto.randomUUID();
                    req.session.twoFactorLogin = {
                        loginToken: token,
                        accountId: account.id,
                        attempts: 0
                    };
                    // Render the two-factor authentication page
                    sharedRenderer.twoFactorAuth(res, interactionDetails, token);
                } else {
                    // If no two-factor authentication, proceed with the login
                    doLogin(res, req, interactionDetails, account.id);
                }
            } else {
                // If login fails, throw an error
                throw new UnexpectedClientError(res.__("validation.login.failed"));
            }
        }
    },

    /**
     * @description Controller for handling OIDC login POST requests for the second factor.
     * Validates the two-factor authentication token and processes the login.
     * @param {Request} req - The HTTP request object.
     * @param {Response} res - The HTTP response object.
     */
    loginSecondFactorPost: async (req, res) => {
        // Retrieve interaction details, if available
        const interactionDetails = await getInteractionDetailsNullable(req, res);

        // Ensure the prompt is for login if interaction details are present
        if (interactionDetails) {
            assert.equal(interactionDetails.prompt.name, 'login');
        }

        // Validate the incoming request data for the two-factor authentication token
        const errors = await validationResult(req);
        const data = await matchedData(req);

        // Validate that validators parsed a valid two factor login token
        if(!data.twoFactorLoginToken) {
            throw new UnexpectedClientError(res.__("validation.two_factor.token.parse_failed"));
        }

        // Validate that two factor login session exists
        if (!req.session.twoFactorLogin) {
            // If session doesn't exist simply render login page
            return sharedRenderer.login(res, interactionDetails, {}, {})
        }
        
        // Retrieve the account ID from the session for the two-factor login
        let { accountId, loginToken } = req.session.twoFactorLogin;

        // If there are validation errors, render the two-factor authentication page with error messages
        if (!errors.isEmpty()) {
            // Increment attempts stored in session
            req.session.twoFactorLogin.attempts++;
            // Append failed second factor login to audit log
            auditService.appendAuditLog(accountService.find.withUsername(data.username),AuditActionType.LOGIN_2FA_FAIL,req)
            // Render two factor login page again
            sharedRenderer.twoFactorAuth(res, interactionDetails, data.twoFactorLoginToken, errors.mapped());
        } else {
 
            
            // Verify the provided login token against the login token from the user session
            if(data.twoFactorLoginToken != loginToken) {
                //This should never be triggered, as login token validation is already done in validators!
                throw new UnexpectedClientError(res.__("validation.login.token.invalid"));
            }

            // Retrieve the account for account id from account service.
            let account = accountService.find.withId(accountId)
            if (account == null) {
                // This should never be triggered, as two factor validation is already done in validators!
                throw new UnexpectedClientError(res.__("validation.account.not_found_by_id"));
            }

            // Verify the provided token against account secret
            if (accountService.twoFactorAuth.check(account, data.token)) {
                // If the token is valid, proceed with the login
                doLogin(res, req, interactionDetails, accountId);
            } else {
                // If the token is invalid, throw an error
                //This should never be triggered, as two factor validation is already done in validators!
                throw new UnexpectedClientError(res.__("validation.login.two_factor.token_invalid"));
            }
        }
    },
};
