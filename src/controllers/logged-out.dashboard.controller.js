import dashboardAuthRenderer from "../renderers/logged-out.dashboard.renderer.js"
import provider from "../oidc/provider.js"

import { matchedData, validationResult } from "express-validator"
import { setProviderSession } from "../oidc/session.js"
import accountService from "../services/account.service.js"
import sharedRenderer from "../renderers/shared.renderer.js"
import { generateNumberCode } from "../helpers/generate-secrets.js"
import { hashPassword } from "../helpers/hash-string.js"
import invitesService from "../services/invites.service.js"
import mailService from "../services/mail.service.js"

/**
 * @typedef {import("express").Request} Request
 */
/**
 * @typedef {import("express").Response} Response
 */

/**
 * @description set session for recovery
 * @param {Request} [req]
 * @param {String} [accountId]
 * @param {Number} [confirmCode]
 * @param {Boolean} [validated]
 */ 
function setAccountRecoverySession(req,accountId=accountId,confirmCode=null,validated=true) {
    req.session.accountRecovery = {
        confirmCode:confirmCode,
        accountId:accountId,
        validated:validated
    }
}

/**
 * @description set session for recovery
 * @param {Request} [req]
 */ 
function validateAccountRecoverySession(req) {
    req.session.accountRecovery.validated = true
}

export default {
    /**
     * @description controller for invite request get method
     * @param {Request} [req]
     * @param {Response} [res]
     */ 
    inviteRequest: async (req,res) => {
        dashboardAuthRenderer.inviteRequest(res)
    },
    /**
     * @description controller for invite request post method
     * @param {Request} [req]
     * @param {Response} [res]
     */ 
    inviteRequestPost: async (req,res) => {
        const errors = await validationResult(req);
        const data = await matchedData(req);

        if (!errors.isEmpty()) {
            return dashboardAuthRenderer.inviteRequest(res,data,errors.mapped())
        }

        const email = data.email;
        const inviteCode = await invitesService.requestWithEmail(email)
        console.log(inviteCode)
        mailService.send.inviteCode(inviteCode,email,res.locals)     
        res.redirect("/register")

    },
    /**
     * @description controller for account recovery get method
     * @param {Request} [req]
     * @param {Response} [res]
     */ 
    recovery: async (req,res) => {
        dashboardAuthRenderer.recoveryRequest(res)
    },
    /**
     * @description controller for account recovery post method
     * @param {Request} [req]
     * @param {Response} [res]
     */ 
    recoveryRequestPost: async (req,res) => {
        const errors = await validationResult(req);
        const data = await matchedData(req);

        if (!errors.isEmpty()) {
            return dashboardAuthRenderer.recoveryRequest(res,data,errors.mapped())
        }

        let account = accountService.find.withUsername(data.username)
        if(!account)
            throw new Error("No account for username")

        switch (data.method) {
            case "email":
                const confirmCode = generateNumberCode()
                setAccountRecoverySession(req,account.id,confirmCode)
                mailService.send.recoveryCode(confirmCode,data.email,res.locals)
                dashboardAuthRenderer.recoveryConfirmCode(res)
                break;
            case "token":
                setAccountRecoverySession(req,account.id)
                validateAccountRecoverySession(req)
                dashboardAuthRenderer.recoveryPasswordPrompt(res)       
                break;
        }     
    },
    /**
     * @description
     * @param {Request} [req]
     * @param {Response} [res]
     */ 
    recoveryConfirmPost: async (req,res) => {
        const errors = await validationResult(req);
        const data = await matchedData(req);

        if (!errors.isEmpty()) {
            return dashboardAuthRenderer.recoveryConfirmCode(res,data,errors.mapped())
        }

        let {confirmCode,accountId} = req.session.accountRecovery
        // Extra check for security
        if(confirmCode != data.confirmCode)
            throw new Error("Missing confirm token")

        validateAccountRecoverySession(req)

        dashboardAuthRenderer.recoveryPasswordPrompt(res)

    },
    /**
     * @description 
     * @param {Request} [req]
     * @param {Response} [res]
     */ 
    recoveryResetPost: async (req,res) => {
        const errors = await validationResult(req);
        const data = await matchedData(req);

        if (!errors.isEmpty()) {
            return dashboardAuthRenderer.recoveryPasswordPrompt(res,data,errors.mapped())
        }

        let {validated,accountId} = req.session.accountRecovery
        // Extra check for security
        if(!validated)
            throw new Error("Missing cofnirm token")

        const account = accountService.find.withId(accountId)

        await accountService.password.set(account,data.password)
        await accountService.twoFactorAuth.set(account,null)

        req.session.accountRecovery = null

        res.redirect('/login/');

    },
    /**
     * @description controller for account login get method
     * @param {Request} [req]
     * @param {Response} [res]
     */ 
    login: async (req,res) => {
        sharedRenderer.login(res)
    },
    /**
     * @description controller for account register get method
     * @param {Request} [req]
     * @param {Response} [res]
     */ 
    register: async (req,res, next) => {
        return dashboardAuthRenderer.register(res,{inviteCode:req.params.invite})
    },
    /**
     * @description controller for account register post method
     * @param {Request} [req]
     * @param {Response} [res]
     */ 
    registerPost: async (req,res) => {
        const errors = await validationResult(req);
        const data = await matchedData(req);

        if (!errors.isEmpty()) {
            return dashboardAuthRenderer.register(res,data,errors.mapped());
        }

        req.session.accountCreation = {
            username: data.username,
            passwordHash: await hashPassword(data.password),
            recoveryMethod: data.recoveryMethod,
            recoveryEmailHash: await hashPassword(data.recoveryEmail),
            recoveryTokenHash: await hashPassword(data.recoveryToken),
            inviteCode: data.inviteCode
        }

        await dashboardAuthRenderer.registerConsent(res,data)
    },
    /**
     * @description controller for account register post method
     * @param {Request} [req]
     * @param {Response} [res]
     */ 
    registerConsentPost: async (req,res) => {
        const errors = await validationResult(req);
        const data = await matchedData(req);

        if (!errors.isEmpty()) {
            return await dashboardAuthRenderer.registerConsent(res,data,errors.mapped());
        }

        const accountSession = req.session.accountCreation
        req.session.accountCreation = null;

        let account = await accountService.create(accountSession.username,accountService.Role.USER)
        accountService.password.set(account,accountSession.passwordHash)

        switch (accountSession.recoveryMethod) {
            case "email":
                accountService.recovery.email.setHash(account,accountSession.recoveryEmailHash)
                break;
            case "token":
                accountService.recovery.token.setHash(account,accountSession.recoveryTokenHash)  
                break;
        }

        invitesService.consume(accountSession.inviteCode)
        invitesService.generate.multi(3,{linkedAccount:account,validationDurationDays:14})

        await setProviderSession(provider,req,res,{accountId: account.id})
        res.redirect('/');
    }
}