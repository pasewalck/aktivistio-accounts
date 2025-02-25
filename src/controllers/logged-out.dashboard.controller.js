import dashboardAuthRenderer from "../renderers/logged-out.dashboard.renderer.js"
import provider from "../oidc/provider.js"

import { matchedData, validationResult } from "express-validator"
import { setProviderSession } from "../oidc/session.js"
import accountDriver from "../drivers/account.driver.js"
import mailsDriver from "../drivers/mails.driver.js"
import sharedRenderer from "../renderers/shared.renderer.js"
import { generateNumberCode } from "../helpers/generate-secrets.js"

/**
 * @typedef {import("express").Request} Request
 */
/**
 * @typedef {import("express").Response} Response
 */

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
        const inviteCode = await accountDriver.requestInvite(email)
        console.log(inviteCode)
        mailsDriver.sendInviteCode(inviteCode,email,res.locals)     
        res.redirect("/register")

    },
    /**
     * @description controller for account recovery get method
     * @param {Request} [req]
     * @param {Response} [res]
     */ 
    recovery: async (req,res) => {
        dashboardAuthRenderer.recovery(res)
    },
    /**
     * @description controller for account recovery post method
     * @param {Request} [req]
     * @param {Response} [res]
     */ 
    recoveryPost: async (req,res) => {
        const errors = await validationResult(req);
        const data = await matchedData(req);

        if (!errors.isEmpty()) {
            return dashboardAuthRenderer.recovery(res,data,errors.mapped())
        }

        let account = accountDriver.findAccountWithUsername(data.username)
        if(!account)
            throw new Error("No account for username")

        const confirmCode = generateNumberCode()

        req.session.accountRecovery = {
            confirmCode:confirmCode,
            accountId:account.id
        }

        switch (data.method) {
            case "email":
                mailsDriver.sendRecoveryCode(confirmCode,data.email,res.locals)
                dashboardAuthRenderer.recoveryPasswordPrompt(res)
                break;
            case "token":
                dashboardAuthRenderer.recoveryPasswordPrompt(res,{confirmCode:confirmCode})       
                break;
        }     
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

        let {confirmCode,accountId} = req.session.accountRecovery
        // Extra check for security
        if(confirmCode != data.confirmCode)
            throw new Error("Missing cofnirm token")

        await accountDriver.setPassword(accountId,data.password)
        await accountDriver.setAccount2fa(accountId,null)

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

        let account = await accountDriver.createAccount(data.username,data.password,accountDriver.Role.USER)

        switch (data.recoveryMethod) {
            case "email":
                accountDriver.setAccountRecoveryEmail(account.id,data.recoveryEmail)
                break;
            case "token":
                accountDriver.setAccountRecoveryToken(account.id,data.recoveryToken)  
                break;
        }

        accountDriver.consumeInvite(data.inviteCode)
        for (let i = 0; i < config.inviteCodes.newUsers.count; i++)
            accountDriver.generateInvite(account,config.inviteCodes.newUsers.waitDays)

        await setProviderSession(provider,req,res,{accountId: account.id})
        res.redirect('/');
    }
}