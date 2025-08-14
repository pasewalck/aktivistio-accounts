import dashboardAuthRenderer from "../renderers/logged-out.dashboard.renderer.js";
import provider from "../helpers/oidc/provider.js";

import { matchedData, validationResult } from "express-validator";
import { setProviderSession } from "../helpers/oidc/session.js";
import accountService from "../services/account.service.js";
import sharedRenderer from "../renderers/shared.renderer.js";
import { hashPassword } from "../helpers/hash-string.js";
import invitesService from "../services/invites.service.js";
import mailService from "../services/mail.service.js";
import { Role } from "../models/roles.js";
import auditService from "../services/audit.service.js";
import { AuditActionType } from "../models/audit-action-types.js";
import { ClientError, UnexpectedClientError } from "../models/errors.js";
import { ActionTokenTypes, PasswordResetChannels } from "../models/action-token-types.js";
import { extendUrl } from "../helpers/url.js";
import env from "../helpers/env.js";
import adapterService from "../services/adapter.service.js";

/**
 * @typedef {import("express").Request} Request
 * Represents an HTTP request in Express.
 */

/**
 * @typedef {import("express").Response} Response
 * Represents an HTTP response in Express.
 */

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
        res.redirect(extendUrl(env.BASE_URL,"register"));
        
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

            if(data.username) {
                let account = accountService.find.withUsername(data.username);
                if(account)
                    switch (data.method) {
                        case "email":
                            auditService.appendAuditLog(account, AuditActionType.PASSWORD_RECOVERY_WITH_EMAIL_HARD_FAIL_AT_EMAIL)
                            break;
                        case "token":
                            auditService.appendAuditLog(account, AuditActionType.PASSWORD_RECOVERY_WITH_TOKEN_HARD_FAIL)
                            break;
                        default:
                            break;
                    }
            }

            return dashboardAuthRenderer.recoveryRequest(res, data, errors.mapped());
        }

        // Attempt to find the account associated with the provided username
        let account = accountService.find.withUsername(data.username);
        // If no account is found, throw an error indicating the username does not exist
        if (!account) throw new UnexpectedClientError(res.__("validation.account.not_found"));

        // Determine the recovery method chosen by the user
        switch (data.method) {
            case "email":
                auditService.appendAuditLog(account, AuditActionType.PASSWORD_RECOVERY_WITH_EMAIL_STARTED)
                // Send the recovery link to the user's email address
                mailService.send.recoveryLink(accountService.actionLink.createRecoveryLink(account, PasswordResetChannels.EMAIL), data.email, res.locals);
                // Render the confirmation code page to inform the user that the code has been sent
                dashboardAuthRenderer.recoveryEmailSent(res);
                break;

            case "token":
                auditService.appendAuditLog(account, AuditActionType.PASSWORD_RECOVERY_WITH_TOKEN_STARTED)
                // Redirect user to url allowing password reset
                res.redirect(accountService.actionLink.createRecoveryLink(account, PasswordResetChannels.RECOVERY_TOKEN))
                break;
            default:
                // If an unsupported recovery method is provided, throw an error
                throw new UnexpectedClientError(res.__("validation.common.recovery_method.unsupported"));
        }


    },


    /**
     * @description Handles the initial password recovery reset request, checking the validity of the recovery link
     * @param {Request} req - The HTTP request object.
     * @param {Response} res - The HTTP response object.
     */
    recoveryReset: async (req, res) => {
        const errors = await validationResult(req);
        const data = await matchedData(req);
        if (!errors.isEmpty()) {
            throw new ClientError(res.__("validation.recovery.link.invalid"));
        }

        return dashboardAuthRenderer.recoveryPasswordPrompt(res, data.actionToken);
    },

    /**
     * @description Handles the password reset form submission, validates input, updates account password, resets two-factor authentication, and logs the recovery action
     * @param {Request} req - The HTTP request object.
     * @param {Response} res - The HTTP response object.
     */
    recoveryResetPost: async (req, res) => {
        const errors = await validationResult(req);
        const data = await matchedData(req);
     
        if (!errors.isEmpty()) {
            return dashboardAuthRenderer.recoveryPasswordPrompt(res, data.actionToken, data, errors.mapped());
        }

        const tokenEntry = accountService.actionToken.getEntry(ActionTokenTypes.PASSWORD_RESET,data.actionToken)
        const account = accountService.find.withId(tokenEntry.payload.accountId);
        accountService.actionToken.consume(ActionTokenTypes.PASSWORD_RESET, data.actionToken)

        // Update the account's password and reset two-factor authentication
        await accountService.password.set(account, data.password);
        await accountService.twoFactorAuth.set(account, null);

        // Logout from all sessions
        adapterService.logoutAllSessions(account.id)

        switch (tokenEntry.payload.resetChannel) {
            case PasswordResetChannels.EMAIL:
                auditService.appendAuditLog(account, AuditActionType.PASSWORD_RECOVERY_WITH_EMAIL_COMPLETE)
                break;
            case PasswordResetChannels.RECOVERY_TOKEN:
                auditService.appendAuditLog(account, AuditActionType.PASSWORD_RECOVERY_WITH_TOKEN_COMPLETE)
                break;
            case PasswordResetChannels.ADMIN:
                auditService.appendAuditLog(account, AuditActionType.PASSWORD_RECOVERY_WITH_TOKEN_COMPLETE)
                break;
            default:
                break;
        }

        res.redirect(extendUrl(env.BASE_URL,"page.login"));
    },

    /**
     * @description Controller for handling GET requests for account login.
     * Renders the login page for users.
     * @param {Request} req - The HTTP request object.
     * @param {Response} res - The HTTP response object.
     */
    login: async (req, res) => {
        sharedRenderer.login(res); // Render the login page
    },

    /**
     * @description Controller for handling GET requests for account registration.
     * Renders the registration page, optionally with an invite code.
     * @param {Request} req - The HTTP request object.
     * @param {Response} res - The HTTP response object.
     * @param {Function} next - The next middleware function in the stack.
     */
    register: async (req, res, next) => {
        return dashboardAuthRenderer.initAccountPage(res, true, { inviteCode: req.params.invite });
    },

    /**
     * @description Controller for handling GET requests for account setup.
     * Renders the setup page.
     * @param {Request} req - The HTTP request object.
     * @param {Response} res - The HTTP response object.
     * @param {Function} next - The next middleware function in the stack.
     */
    accountSetup: async (req, res, next) => {
        const errors = await validationResult(req);
        const data = await matchedData(req);

        if (!errors.isEmpty()) {
            throw new ClientError(res.__("validation.account.setup.link_invalid"));
        }
        return dashboardAuthRenderer.initAccountPage(res, false,{actionToken: data.actionToken});
    },

    /**
     * @description Controller for handling POST requests for account registration.
     * Validates the registration data and stores it in the session.
     * @param {Request} req - The HTTP request object.
     * @param {Response} res - The HTTP response object.
     */
    registerPost: async (req, res) => {
        const errors = await validationResult(req);
        const data = await matchedData(req);

        if (!errors.isEmpty()) {
            return dashboardAuthRenderer.initAccountPage(res, true, data, errors.mapped());
        }

        // Store account creation data in the session
        req.session.accountCreation = {
            username: data.username,
            passwordHash: await hashPassword(data.password),
            recoveryMethod: data.recoveryMethod,
            recoveryEmailHash: data.recoveryEmail ? await hashPassword(data.recoveryEmail) : null,
            recoveryTokenHash: data.recoveryToken ? await hashPassword(data.recoveryToken) : null,
            inviteCode: data.inviteCode
        };

        await dashboardAuthRenderer.initAccountPageConsent(res, true, {}); // Render consent page
    },


    /**
     * @description Controller for handling POST requests for account setup.
     * Validates the setup data and stores it in the session.
     * @param {Request} req - The HTTP request object.
     * @param {Response} res - The HTTP response object.
     */
    accountSetupPost: async (req, res) => {
        const errors = await validationResult(req);
        const data = await matchedData(req);
        if (!errors.isEmpty()) {
            return dashboardAuthRenderer.initAccountPage(res, false, data, errors.mapped());
        }

        const actionTokenEntry = accountService.actionToken.getEntry(ActionTokenTypes.ACCOUNT_SETUP,data.actionToken)

        // Store account setup data in the session
        req.session.accountSetup = {
            passwordHash: await hashPassword(data.password),
            recoveryMethod: data.recoveryMethod,
            recoveryEmailHash: data.recoveryEmail ? await hashPassword(data.recoveryEmail) : null,
            recoveryTokenHash: data.recoveryToken ? await hashPassword(data.recoveryToken) : null,
            accountId: actionTokenEntry.payload.accountId,
            actionToken: data.actionToken
        };

        await dashboardAuthRenderer.initAccountPageConsent(res, false, {actionToken: data.actionToken}); // Render consent page
    },

    /**
     * @description Controller for handling POST requests for registration consent.
     * Finalizes the account creation process and stores the account in the database.
     * @param {Request} req - The HTTP request object.
     * @param {Response} res - The HTTP response object.
     */
    registerConsentPost: async (req, res) => {
        const errors = await validationResult(req);
        const data = await matchedData(req);

        if (!errors.isEmpty()) {
            return await dashboardAuthRenderer.initAccountPageConsent(res, true, data, errors.mapped());
        }

        const accountSession = req.session.accountCreation; // Retrieve the account creation session data
        req.session.accountCreation = null; // Clear the session data after use

        // Check if invite code is still valid.
        if (!invitesService.validate(accountSession.inviteCode))
            throw new ClientError(res.__("validation.invite.code.expired"));
        // Check if username still does not exist.
        if (accountService.find.withUsername(accountSession.username))
            throw new ClientError(res.__("validation.username.taken_after_selection"));

        // Create a new account with the provided username from session and default role
        let account = await accountService.create(accountSession.username, Role.USER);
        accountService.password.setHash(account, accountSession.passwordHash); // Set the hashed password for the account

        // Set the recovery method based on the user's choice saved in session
        switch (accountSession.recoveryMethod) {
            case "email":
                accountService.common.recovery_email.setHash(account, accountSession.recoveryEmailHash); // Set the email recovery hash
                break;
            case "token":
                accountService.common.recovery_token.setHash(account, accountSession.recoveryTokenHash); // Set the token recovery hash
                break;
        }

        // Consume the invite code to prevent reuse
        invitesService.consume(accountSession.inviteCode);
        // Generate additional invite codes for the new account
        invitesService.generate.multi(3, { linkedAccount: account, validationDurationDays: 14 });

        auditService.appendAuditLog(account, AuditActionType.REGISTER)

        // Set the provider session for the newly created account
        await setProviderSession(provider, req, res, { accountId: account.id });
        accountService.lastLogin.register(account)
        res.redirect(extendUrl(env.BASE_URL));
        
    },


    /**
     * @description Controller for handling POST requests for setup consent.
     * Finalizes the account setup process and stores the account setup data in the database.
     * @param {Request} req - The HTTP request object.
     * @param {Response} res - The HTTP response object.
     */
    accountSetupConsentPost: async (req, res) => {
        const errors = await validationResult(req);
        const data = await matchedData(req);

        if (!errors.isEmpty()) {
            return await dashboardAuthRenderer.initAccountPageConsent(res, false, data, errors.mapped());
        }

        const accountSession = req.session.accountSetup; // Retrieve the account creation session data

        if (accountSession.actionToken != data.actionToken)
            throw new UnexpectedClientError(res.__("validation.action_token.mismatch"));


        accountService.actionToken.consume(ActionTokenTypes.ACCOUNT_SETUP,accountSession.actionToken)

        req.session.accountSetup = null; // Clear the session data after use

        let account = await accountService.find.withId(accountSession.accountId)

        accountService.password.setHash(account, accountSession.passwordHash); // Set the hashed password for the account

        // Set the recovery method based on the user's choice saved in session
        switch (accountSession.recoveryMethod) {
            case "email":
                accountService.common.recovery_email.setHash(account, accountSession.recoveryEmailHash); // Set the email recovery hash
                break;
            case "token":
                accountService.common.recovery_token.setHash(account, accountSession.recoveryTokenHash); // Set the token recovery hash
                break;
        }

        // Consume the invite code to prevent reuse
        invitesService.consume(accountSession.inviteCode);
        // Generate additional invite codes for the new account
        invitesService.generate.multi(3, { linkedAccount: account, validationDurationDays: 14 });

        auditService.appendAuditLog(account, AuditActionType.REGISTER)

        // Set the provider session for the newly created account
        await setProviderSession(provider, req, res, { accountId: account.id });
        accountService.lastLogin.register(account)
        res.redirect(extendUrl(env.BASE_URL));
    }
};
