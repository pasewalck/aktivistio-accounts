import dashboardRenderer from "../renderers/dashboard.renderer.js";
import provider from "../helpers/oidc/provider.js";
import { matchedData, validationResult } from "express-validator";
import accountService from "../services/account.service.js";
import invitesService from "../services/invites.service.js";
import adapterService from "../services/adapter.service.js";
import auditService from "../services/audit.service.js";
import { AuditActionType } from "../models/audit-action-types.js";
import { ClientError } from "../models/errors.js";
import { PasswordResetChannels } from "../models/action-token-types.js";
import mailService from "../services/mail.service.js";
import env from "../helpers/env.js";
import { extendUrl } from "../helpers/url.js";

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
     * @description Renders the dashboard services page.
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     */
    services: (req, res) => {
        dashboardRenderer.services(req, res);
    },

    /**
     * @description Renders the user account page in the dashboard.
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     */
    account: (req, res) => {
        dashboardRenderer.account(req, res);
    },

    /**
     * @description Renders the change password page for the user account.
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     */
    accountChangePassword: (req, res) => {
        dashboardRenderer.accountChangePassword(req, res);
    },

    /**
     * @description Handles the POST request to change the user's password.
     * Validates the request data and updates the password if valid.
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     */
    accountChangePasswordPost: async (req, res) => {
        const errors = await validationResult(req);
        const data = await matchedData(req);

        if (!errors.isEmpty()) {
            // Append password change fail if fail is due to incorrect password
            if(errors.mapped()["currentPassword"])
                auditService.appendAuditLog(req.account,AuditActionType.PASSWORD_CHANGE_FAIL,req)
            return dashboardRenderer.accountChangePassword(req, res, data, errors.mapped());
        }

        auditService.appendAuditLog(req.account,AuditActionType.PASSWORD_CHANGED,req)

        await accountService.password.set(req.account, data.newPassword);
        res.redirect(extendUrl(env.BASE_URL,"account"));

    },

    /**
     * @description Renders the account deletion confirmation page.
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     */
    accountDelete: (req, res) => {
        dashboardRenderer.delete(req, res);
    },

    /**
     * @description Handles the POST request to delete the user's account.
     * Validates the request data and deletes the account if valid.
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     */
    accountDeletePost: async (req, res) => {
        const errors = await validationResult(req);
        const data = await matchedData(req);

        if (!errors.isEmpty()) {
            return dashboardRenderer.delete(req, res, data, errors.mapped());
        }

        await accountService.purge(req.account);
        res.redirect(extendUrl(env.BASE_URL));

    },

    /**
     * @description Renders the two-factor authentication (2FA) page for the user account.
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     */
    account2fa: (req, res) => {
        dashboardRenderer.twoFactorAuth(req, res);
    },

    /**
     * @description Renders the page to add two-factor authentication (2FA) for the user account.
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     */
    accountAdd2fa: (req, res) => {
        dashboardRenderer.addTwoFactorAuth(req, res);
    },

    /**
     * @description Handles the POST request to change the user's two-factor authentication (2FA) settings.
     * Validates the request data and updates the 2FA secret if valid.
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     */
    accountChange2faPost: async (req, res) => {
        const errors = await validationResult(req);
        const data = await matchedData(req);

        if (!errors.isEmpty()) {
            return dashboardRenderer.addTwoFactorAuth(req, res, data, errors.mapped());
        }

        auditService.appendAuditLog(req.account,data.secret ? AuditActionType.TWO_FACTOR_AUTH_ENABLED : AuditActionType.TWO_FACTOR_AUTH_DISABLED,req)

        accountService.twoFactorAuth.set(req.account, data.secret);
        res.redirect(extendUrl(env.BASE_URL,"account","2fa"));

    },

    /**
     * @description Handles the POST request to remove two-factor authentication (2FA) for the user account.
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     */
    accountRemove2faPost: async (req, res) => {
        auditService.appendAuditLog(req.account,AuditActionType.TWO_FACTOR_AUTH_DISABLED,req)

        accountService.twoFactorAuth.set(req.account, null);
        res.redirect(extendUrl(env.BASE_URL,"account","2fa"));
    },

    /**
     * @description Renders the account recovery page.
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     */
    accountRecovery: (req, res) => {
        dashboardRenderer.recovery(req, res);
    },

    /**
     * @description Renders the page to set the recovery email for the user account.
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     */
    accountRecoverySetEmail: (req, res) => {
        dashboardRenderer.setRecoveryEmail(req, res);
    },

    /**
     * @description Renders the page to set the recovery token for the user account.
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     */
    accountRecoverySetToken: (req, res) => {
        dashboardRenderer.setRecoveryToken(req, res);
    },

    /**
     * @description Handles the request to delete the recovery email method for the user account.
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     */
    accountRecoveryDeleteEmail: (req, res) => {
        dashboardRenderer.deleteRecoveryMethod(req, res, "email");
    },

    /**
     * @description Handles the request to delete the recovery token method for the user account.
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     */
    accountRecoveryDeleteToken: (req, res) => {
        dashboardRenderer.deleteRecoveryMethod(req, res, "token");
    },

    /**
     * @description Handles the POST request to delete the recovery email method.
     * Validates the request data and deletes the email if valid.
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     */
    accountRecoveryDeleteEmailPost: async (req, res) => {
        const errors = await validationResult(req);
        const data = await matchedData(req);

        if (!errors.isEmpty()) {
            // Append recovery method change fail if fail is due to incorrect password
            if(errors.mapped()["currentPassword"])
                auditService.appendAuditLog(req.account,AuditActionType.RECOVERY_METHOD_UPDATE_FAIL,req)
            return dashboardRenderer.deleteRecoveryMethod(req, res, "email", data, errors.mapped());
        }

        auditService.appendAuditLog(req.account,AuditActionType.RECOVERY_METHOD_UPDATED,req)

        await accountService.common.recovery_email.set(req.account, null);
        res.redirect(extendUrl(env.BASE_URL,"account","recovery"));

    },

    /**
     * @description Handles the POST request to delete the recovery token method.
     * Validates the request data and deletes the token if valid.
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     */
    accountRecoveryDeleteTokenPost: async (req, res) => {
        const errors = await validationResult(req);
        const data = await matchedData(req);

        if (!errors.isEmpty()) {
            // Append recovery method change fail if fail is due to incorrect password
            if(errors.mapped()["currentPassword"])
                auditService.appendAuditLog(req.account,AuditActionType.RECOVERY_METHOD_UPDATE_FAIL,req)
            return dashboardRenderer.deleteRecoveryMethod(req, res, "token", data, errors.mapped());
        }

        auditService.appendAuditLog(req.account,AuditActionType.RECOVERY_METHOD_UPDATED,req)

        await accountService.common.recovery_token.set(req.account, null);
        res.redirect(extendUrl(env.BASE_URL,"account","recovery"));

    },

    /**
     * @description Handles the POST request to set the recovery email method.
     * Validates the request data and sets the email if valid.
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     */
    accountRecoverySetEmailPost: async (req, res) => {
        const errors = await validationResult(req);
        const data = await matchedData(req);

        if (!errors.isEmpty()) {
            // Append recovery method change fail if fail is due to incorrect password
            if(errors.mapped()["currentPassword"])
                auditService.appendAuditLog(req.account,AuditActionType.RECOVERY_METHOD_UPDATE_FAIL,req)
            return dashboardRenderer.setRecoveryEmail(req, res, data, errors.mapped());
        }

        auditService.appendAuditLog(req.account,AuditActionType.RECOVERY_METHOD_UPDATED,req)

        await accountService.common.recovery_email.set(req.account, data.email);
        res.redirect(extendUrl(env.BASE_URL,"account","recovery"));

    },

    /**
     * @description Handles the POST request to set the recovery token method.
     * Validates the request data and sets the token if valid.
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     */
    accountRecoverySetTokenPost: async (req, res) => {
        const errors = await validationResult(req);
        const data = await matchedData(req);

        if (!errors.isEmpty()) {
            // Append recovery method change fail if fail is due to incorrect password
            if(errors.mapped()["currentPassword"])
                auditService.appendAuditLog(req.account,AuditActionType.RECOVERY_METHOD_UPDATE_FAIL,req)
            return dashboardRenderer.setRecoveryToken(req, res, data, errors.mapped());
        }

        auditService.appendAuditLog(req.account,AuditActionType.RECOVERY_METHOD_UPDATED,req)

        await accountService.common.recovery_token.set(req.account, req.body.token);
        res.redirect(extendUrl(env.BASE_URL,"account","recovery"));

    },

    /**
     * @description Renders the invites page in the dashboard.
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     */
    invites: (req, res) => {
        dashboardRenderer.invites(req, res);
    },

    /**
     * @description Handles the request to share an invite.
     * Validates the request data and renders the invite share page if valid.
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     */
    inviteShare: async (req, res) => {
        const errors = await validationResult(req);
        const data = await matchedData(req);

        if (!errors.isEmpty()) {
            throw new ClientError(errors.array()[0].msg);
        }

        dashboardRenderer.inviteShare(req, res, data.invite);
    },

    /**
     * @description Handles the POST request to generate a new invite.
     * Validates the request data and creates the invite if valid.
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     */
    invitesGeneratePost: async (req, res) => {
        const errors = await validationResult(req);
        const data = await matchedData(req);

        if (!errors.isEmpty()) {
            throw new ClientError(errors.array()[0].msg);
        }

        invitesService.generate.single({
            maxUses: parseInt(data.count, 10),
            linkedAccount: req.account,
            expireDate: data.date ? data.date : null
        });
        res.redirect(extendUrl(env.BASE_URL,"invites"));
    },

    /**
     * @description Handles the POST request to terminate an existing invite.
     * Validates the request data and removes the invite if valid.
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     */
    terminateInvitePost: async (req, res) => {
        const errors = await validationResult(req);
        const data = await matchedData(req);

        if (!errors.isEmpty()) {
            throw new ClientError(errors.array()[0].msg);
        }

        invitesService.remove(data.code);
        res.redirect(extendUrl(env.BASE_URL,"invites"));

    },

    /**
     * @description Renders the service management page for adding a new service.
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     */
    serviceAdd: async (req, res) => {
        dashboardRenderer.manageService(req, res, null, {
            configuration: JSON.stringify({
                "client_name": "Example Name",
                "client_id": "exampleClientId",
                "client_uri": "https://example.com",
                "client_secret": "exampleSecret",
                "grant_types": [
                    "authorization_code"
                ],
                "redirect_uris": [
                    "https://example.com/done"
                ],
                "response_types": [
                    "code"
                ]
            }, null, "  ")
        });
    },

    /**
     * @description Handles the POST request to add a new service.
     * Validates the request data and saves the service configuration if valid.
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     */
    serviceAddPost: async (req, res) => {
        const errors = await validationResult(req);
        const data = await matchedData(req);

        if (!errors.isEmpty()) {
            return dashboardRenderer.manageService(req, res, null, data, errors.mapped());
        }

        const configuration = JSON.parse(data.configuration);
        const newClientId = configuration["client_id"];
        adapterService.setEntry("Client", newClientId, configuration);

        res.redirect(extendUrl(env.BASE_URL,"services"));
    },

    /**
     * @description Renders the service management page for editing an existing service.
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     */
    serviceEdit: async (req, res) => {
        const errors = await validationResult(req);
        const data = await matchedData(req);

        if (!errors.isEmpty()) {
            throw new ClientError(errors.array()[0].msg);
        }

        const clientId = data.id;
        dashboardRenderer.manageService(req, res, clientId, {
            configuration: JSON.stringify(adapterService.getEntry("Client", clientId), null, "  ")
        });
    },

    /**
     * @description Handles the POST request to save changes to an existing service.
     * Validates the request data and updates the service configuration if valid.
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     */
    serviceEditSavePost: async (req, res) => {
        const errors = await validationResult(req);
        const data = await matchedData(req);
        const clientId = data.id;

        if (!errors.isEmpty()) {
            if (!clientId) {
                throw new ClientError(errors.array()[0].msg);
            } else {
                return dashboardRenderer.manageService(req, res, clientId, data, errors.mapped());
            }
        }

        const configuration = JSON.parse(data.configuration);
        const newClientId = configuration["client_id"];

        // Remove the old entry if the client ID has changed
        if (newClientId !== clientId) {
            adapterService.removeEntry("Client", clientId);
        }
        adapterService.setEntry("Client", newClientId, configuration);

        res.redirect(extendUrl(env.BASE_URL,"services","edit",newClientId));
    },

    /**
     * @description Handles the POST request to delete an existing service.
     * Validates the request data and removes the service if valid.
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     */
    serviceEditDeletePost: async (req, res) => {
        const errors = await validationResult(req);
        const data = await matchedData(req);
        const clientId = data.id;

        if (!errors.isEmpty()) {
            if (!clientId) {
                throw new ClientError(errors.array()[0].msg);
            } else {
                return dashboardRenderer.manageService(req, res, clientId, {
                    configuration: JSON.stringify(adapterService.getEntry("Client", clientId), null, "  "),
                    ...data
                }, errors.mapped());
            }
        }

        adapterService.removeEntry("Client", clientId);
        res.redirect("/services");
        res.redirect(extendUrl(env.BASE_URL,"services"));

    },

    /**
     * @description Renders the users management page in the dashboard.
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     */
    users: async (req, res) => {
        dashboardRenderer.users(req, res);
    },

    /**
     * @description Renders the user add page in the dashboard.
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     */
    addUser: async (req, res) => {
        dashboardRenderer.userAdd(req, res);
    },

    /**
     * @description Handles user add POST request.
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     */
    addUserPost: async (req, res) => {
        const errors = await validationResult(req);
        const data = await matchedData(req);

        if (!errors.isEmpty()) {
            return dashboardRenderer.userAdd(req, res, data, errors.mapped());
        }
        const user = await accountService.create(data.username,data.role)

        dashboardRenderer.manageUser(req, res, user.id);
    },


    /**
     * @description Renders the user management page for a specific user.
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     */
    manageUser: async (req, res) => {
        const errors = await validationResult(req);
        const data = await matchedData(req);

        if (!errors.isEmpty()) {
            throw new ClientError(errors.array()[0].msg);
        }

        dashboardRenderer.manageUser(req, res, data.id);
    },


    /**
     * @description Renders the audit log overview.
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     */
    auditLog: async (req, res) => {
        const errors = await validationResult(req);
        const data = await matchedData(req);

        if (!errors.isEmpty()) {
            throw new ClientError(errors.array()[0].msg);
        }
        dashboardRenderer.auditLog(req, res,data.weeks ? data.weeks : 1);
    },

    /**
     * @description Handles the POST request to update a user's role.
     * Validates the request data and updates the user's role if valid.
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     */
    manageUserUpdatePost: async (req, res) => {
        const errors = await validationResult(req);
        const data = await matchedData(req);

        if (!errors.isEmpty()) {
            return dashboardRenderer.manageUser(req, res, data.id, data, errors.mapped());
        }

        accountService.setRole(accountService.find.withId(data.id), data.accountUpdateRole);
        res.redirect(extendUrl(env.BASE_URL,"user","manage",data.id));
    },

    /**
     * @description Handles the POST request to delete a user.
     * Validates the request data and deletes the user if valid.
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     */
    manageUserDeletePost: async (req, res) => {
        const errors = await validationResult(req);
        const data = await matchedData(req);

        if (!errors.isEmpty()) {
            return dashboardRenderer.manageUser(req, res, data.id, data, errors.mapped());
        }
        
        accountService.purge(accountService.find.withId(data.id));
        res.redirect(extendUrl(env.BASE_URL,"users"));
    },

    /**
     * @description 
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     */
    sendUserAccountSetupEmailPost: async (req, res) => {
        const errors = await validationResult(req);
        const data = await matchedData(req);

        if (!errors.isEmpty()) {
            return dashboardRenderer.manageUser(req, res, data.id, data, errors.mapped());
        }

        const link = accountService.actionLink.createSetupLink(accountService.find.withId(data.id),PasswordResetChannels.ADMIN, 60*60*25*60) // 60 Days
        mailService.send.setupLink(link,data.email,res.locals)

        dashboardRenderer.setupEmailSent(res)
    },

    /**
     * @description 
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     */
    sendUserAccountRecoveryEmailPost: async (req, res) => {
        const errors = await validationResult(req);
        const data = await matchedData(req);

        if (!errors.isEmpty()) {
            return dashboardRenderer.manageUser(req, res, data.id, data, errors.mapped());
        }

        const link = accountService.actionLink.createRecoveryLink(accountService.find.withId(data.id),PasswordResetChannels.ADMIN)
        mailService.send.recoveryLink(link,data.email,res.locals)

        dashboardRenderer.recoveryEmailSent(res)
    },

    /**
     * @description Handles the POST request for user logout.
     * Destroys the user session and redirects to the login page.
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     */
    logoutPost: async (req, res) => {
        const session = await provider.Session.get(provider.createContext(req, res));
        session.destroy();

        res.redirect(extendUrl(env.BASE_URL,"page.login"));
    },
};


