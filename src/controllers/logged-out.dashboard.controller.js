import dashboardAuthRenderer from "../renderers/logged-out.dashboard.renderer.js";
import provider from "../helpers/oidc/provider.js";

import { matchedData, validationResult } from "express-validator";
import { setProviderSession } from "../helpers/oidc/session.js";
import accountService from "../services/account.service.js";
import sharedRenderer from "../renderers/shared.renderer.js";
import { generateTypeableCode } from "../helpers/generate-secrets.js";
import { hashPassword } from "../helpers/hash-string.js";
import invitesService from "../services/invites.service.js";
import mailService from "../services/mail.service.js";
import { Role } from "../models/roles.js";
import auditService from "../services/audit.service.js";
import { AuditActionType } from "../models/audit-action-types.js";

/**
 * @typedef {import("express").Request} Request
 * Represents an HTTP request in Express.
 */

/**
 * @typedef {import("express").Response} Response
 * Represents an HTTP response in Express.
 */

/**
 * @description Sets the session for account recovery.
 * This function initializes the account recovery session with the provided account ID,
 * confirmation code, and validation status.
 * @param {Request} req - The HTTP request object.
 * @param {String} [accountId] - The ID of the account being recovered.
 * @param {Number} [confirmCode] - The confirmation code for recovery.
 * @param {Boolean} [validated] - Indicates whether the recovery has been validated.
 * @param {String} [recoveryMethod] - The recovery method used.
 */
function setAccountRecoverySession(req,recoveryMethod = null, accountId = null, confirmCode = null, validated = true) {
    req.session.accountRecovery = {
        confirmCode: confirmCode,
        recoveryMethod: recoveryMethod,
        accountId: accountId,
        attempts: 0,
        validated: validated
    };
}

/**
 * @description Validates the account recovery session.
 * This function sets the validated status of the account recovery session to true.
 * @param {Request} req - The HTTP request object.
 */
function validateAccountRecoverySession(req) {
    req.session.accountRecovery.validated = true;
}

export default {
    /**
     * @description Controller for handling GET requests for invite requests.
     * Renders the invite request page.
     * @param {Request} req - The HTTP request object.
     * @param {Response} res - The HTTP response object.
     */
    inviteRequest: async (req, res) => {
        dashboardAuthRenderer.inviteRequest(res);
    },

    /**
     * @description Controller for handling POST requests for invite requests.
     * Validates the request data and sends an invite code to the provided email.
     * @param {Request} req - The HTTP request object.
     * @param {Response} res - The HTTP response object.
     */
    inviteRequestPost: async (req, res) => {
        const errors = await validationResult(req);
        const data = await matchedData(req);

        if (!errors.isEmpty()) {
            return dashboardAuthRenderer.inviteRequest(res, data, errors.mapped());
        }

        const email = data.email;
        const inviteCode = await invitesService.requestWithEmail(email);

        mailService.send.inviteCode(inviteCode, email, res.locals);
        res.redirect("/register");
    },

    /**
     * @description Controller for handling GET requests for account recovery.
     * Renders the account recovery request page.
     * @param {Request} req - The HTTP request object.
     * @param {Response} res - The HTTP response object.
     */
    recovery: async (req, res) => {
        dashboardAuthRenderer.recoveryRequest(res);
    },

    /**
     * @description Controller for handling POST requests for account recovery.
     * Validates the request data and initiates the recovery process based on the selected method.
     * @param {Request} req - The HTTP request object.
     * @param {Response} res - The HTTP response object.
     */
    recoveryRequestPost: async (req, res) => {
        const errors = await validationResult(req);
        const data = await matchedData(req);
    
        if (!errors.isEmpty()) {

            switch (data.method) {
                case "email":
                    auditService.appendAuditLog(account,AuditActionType.PASSWORD_RECOVERY_WITH_EMAIL_HARD_FAIL_AT_EMAIL)
                    break;
                case "token":
                    auditService.appendAuditLog(account,AuditActionType.PASSWORD_RECOVERY_WITH_TOKEN_HARD_FAIL)
                    break;
                default:
                    break;
            }
            return dashboardAuthRenderer.recoveryRequest(res, data, errors.mapped());
        }
    
        // Attempt to find the account associated with the provided username
        let account = accountService.find.withUsername(data.username);
        // If no account is found, throw an error indicating the username does not exist
        if (!account) throw new Error("No account for username");
    
        // Determine the recovery method chosen by the user
        switch (data.method) {
            case "email":
                // Determine length of confirm token based on audit log for user
                const confirmCodeLength = Math.max(auditService.getAuditLogCount(account,AuditActionType.PASSWORD_RECOVERY_WITH_EMAIL_HARD_FAIL_AT_TOKEN)+6,10)
                // Generate a confirmation code for email recovery
                const confirmCode = await generateTypeableCode(confirmCodeLength);
                // Set the account recovery session with the account ID and confirmation code
                setAccountRecoverySession(req, data.method, account.id, confirmCode);
                // Send the recovery code to the user's email address
                mailService.send.recoveryCode(confirmCode, data.email, res.locals);
                // Render the confirmation code page to inform the user that the code has been sent
                dashboardAuthRenderer.recoveryConfirmCode(res);
                // Append password recovery request with email audit log
                auditService.appendAuditLog(account,AuditActionType.PASSWORD_RECOVERY_WITH_EMAIL_STARTED)
                break;
    
            case "token":
                // Set the account recovery session with the account ID (no confirmation code needed for token method)
                setAccountRecoverySession(req, data.method, account.id);
                // Validate the recovery session to indicate that the user has initiated the recovery process
                validateAccountRecoverySession(req);
                // Render the password prompt page to allow the user to set a new password
                dashboardAuthRenderer.recoveryPasswordPrompt(res);
                // Append password recovery request with email audit log
                auditService.appendAuditLog(account,AuditActionType.PASSWORD_RECOVERY_WITH_TOKEN_STARTED)
                break;
            default:
                // If an unsupported recovery method is provided, throw an error
                throw new Error("Unsupported recovery method");
        }


    },

    /**
     * @description Controller for handling POST requests for confirming recovery.
     * Validates the confirmation code and prompts the user to reset their password.
     *
     * @param {Request} req - The HTTP request object.
     * @param {Response} res - The HTTP response object.
     */
    recoveryConfirmPost: async (req, res) => {
        const errors = await validationResult(req);
        const data = await matchedData(req);

        if (!req.session.accountRecovery) {
            return dashboardAuthRenderer.recoveryRequest(res);
        }

        let { confirmCode, attempts, accountId, recoveryMethod } = req.session.accountRecovery;
    
        // Attempt to find the account associated with userId from session
        let account = accountService.find.withId(accountId);
        // If no account is found, throw an error indicating the username does not exist
        if (!account) throw new Error("Missing valid user");

        if (!errors.isEmpty()) {

            // Check if user still has attempts left
            if(attempts > 4) {
                // Terminate session and render recovery request page
                req.session.accountRecovery = null;
                return dashboardAuthRenderer.recoveryRequest(res, data, {
                    tooManyFails: {
                        msg: res.__("Too many failed attempts. Recovery process terminated.")
                    }
                })
            }
            // Increment attempts stored in session
            req.session.accountRecovery.attempts++;

            switch (recoveryMethod) {
                case "email":
                    auditService.appendAuditLog(account,AuditActionType.PASSWORD_RECOVERY_WITH_EMAIL_HARD_FAIL_AT_TOKEN)
                    break;
                case "token":
                    auditService.appendAuditLog(account,AuditActionType.PASSWORD_RECOVERY_WITH_TOKEN_HARD_FAIL)
                    break;
                default:
                    break;
            }
            return dashboardAuthRenderer.recoveryConfirmCode(res, data, errors.mapped());
        }

        // Extra check for security: ensure the provided confirmation code matches the stored one
        if (confirmCode !== data.confirmCode) {
            throw new Error("Missing or invalid confirm token");
        }

        validateAccountRecoverySession(req); // Mark the session as validated
        dashboardAuthRenderer.recoveryPasswordPrompt(res); // Prompt the user to enter a new password
    },

    /**
     * @description Controller for handling POST requests to reset the password.
     * Validates the new password and updates the account's password in the database.
     *
     * @param {Request} req - The HTTP request object.
     * @param {Response} res - The HTTP response object.
     */
    recoveryResetPost: async (req, res) => {
        const errors = await validationResult(req);
        const data = await matchedData(req);

        if (!errors.isEmpty()) {
            return dashboardAuthRenderer.recoveryPasswordPrompt(res, data, errors.mapped());
        }

        let { validated, accountId } = req.session.accountRecovery;
        // Extra check for security: ensure the recovery session has been validated
        if (!validated) {
            throw new Error("Missing confirm token");
        }

        const account = accountService.find.withId(accountId); // Retrieve the account by ID

        // Update the account's password and reset two-factor authentication
        await accountService.password.set(account, data.password);
        await accountService.twoFactorAuth.set(account, null);

        switch (recoveryMethod) {
            case "email":
                auditService.appendAuditLog(account,AuditActionType.PASSWORD_RECOVERY_WITH_EMAIL_COMPLETE)
                break;
            case "token":
                auditService.appendAuditLog(account,AuditActionType.PASSWORD_RECOVERY_WITH_TOKEN_COMPLETE)
                break;
            default:
                break;
        }
        req.session.accountRecovery = null; // Clear the recovery session
        res.redirect('/login/'); // Redirect to the login page
    },

    /**
     * @description Controller for handling GET requests for account login.
     * Renders the login page for users.
     *
     * @param {Request} req - The HTTP request object.
     * @param {Response} res - The HTTP response object.
     */
    login: async (req, res) => {
        sharedRenderer.login(res); // Render the login page
    },

    /**
     * @description Controller for handling GET requests for account registration.
     * Renders the registration page, optionally with an invite code.
     *
     * @param {Request} req - The HTTP request object.
     * @param {Response} res - The HTTP response object.
     * @param {Function} next - The next middleware function in the stack.
     */
    register: async (req, res, next) => {
        return dashboardAuthRenderer.register(res, { inviteCode: req.params.invite });
    },

    /**
     * @description Controller for handling POST requests for account registration.
     * Validates the registration data and stores it in the session.
     *
     * @param {Request} req - The HTTP request object.
     * @param {Response} res - The HTTP response object.
     */
    registerPost: async (req, res) => {
        const errors = await validationResult(req);
        const data = await matchedData(req);

        if (!errors.isEmpty()) {
            return dashboardAuthRenderer.register(res, data, errors.mapped());
        }

        // Store account creation data in the session
        req.session.accountCreation = {
            username: data.username,
            passwordHash: await hashPassword(data.password),
            recoveryMethod: data.recoveryMethod,
            recoveryEmailHash: await hashPassword(data.recoveryEmail),
            recoveryTokenHash: await hashPassword(data.recoveryToken),
            inviteCode: data.inviteCode
        };

        await dashboardAuthRenderer.registerConsent(res, data); // Render consent page
    },

    /**
     * @description Controller for handling POST requests for registration consent.
     * Finalizes the account creation process and stores the account in the database.
     *
     * @param {Request} req - The HTTP request object.
     * @param {Response} res - The HTTP response object.
     */
    registerConsentPost: async (req, res) => {
        const errors = await validationResult(req);
        const data = await matchedData(req);

        if (!errors.isEmpty()) {
            return await dashboardAuthRenderer.registerConsent(res, data, errors.mapped());
        }

        const accountSession = req.session.accountCreation; // Retrieve the account creation session data
        req.session.accountCreation = null; // Clear the session data after use

        // Create a new account with the provided username from session and default role
        let account = await accountService.create(accountSession.username, Role.USER);
        accountService.password.set(account, accountSession.passwordHash); // Set the hashed password for the account

        // Set the recovery method based on the user's choice saved in session
        switch (accountSession.recoveryMethod) {
            case "email":
                accountService.recovery.email.setHash(account, accountSession.recoveryEmailHash); // Set the email recovery hash
                break;
            case "token":
                accountService.recovery.token.setHash(account, accountSession.recoveryTokenHash); // Set the token recovery hash
                break;
        }

        // Consume the invite code to prevent reuse
        invitesService.consume(accountSession.inviteCode);
        // Generate additional invite codes for the new account
        invitesService.generate.multi(3, { linkedAccount: account, validationDurationDays: 14 });

        auditService.appendAuditLog(account,AuditActionType.REGISTER)

        // Set the provider session for the newly created account
        await setProviderSession(provider, req, res, { accountId: account.id });
        res.redirect('/'); // Redirect to the home page after successful registration
    }
};
