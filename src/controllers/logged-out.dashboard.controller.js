import dashboardAuthRenderer from "../renderers/logged-out.dashboard.renderer.js"
import provider from "../oidc/provider.js"
import loginHandler from "../handlers/login.handler.js"
import recoveryHandler from "../handlers/recovery.handler.js"
import requestInviteHandler from "../handlers/request-invite.handler.js"

import { matchedData, validationResult } from "express-validator"
import { setProviderSession } from "../oidc/session.js"
import accountDriver from "../drivers/account.driver.js"
import sharedRenderer from "../renderers/shared.renderer.js"

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
        dashboardAuthRenderer.inviteRequest(req,res)
    },
    /**
     * @description controller for invite request post method
     * @param {Request} [req]
     * @param {Response} [res]
     */ 
    inviteRequestPost: async (req,res) => {
        try {
            await requestInviteHandler.requestInviteHandler(req,res)
            res.redirect("/register")
        } catch (error) {
            if (error instanceof requestInviteHandler.RequestInviteError)
                return dashboardAuthRenderer.inviteRequest(req,res,error.message)
            else
                throw error;
        }        
    },
    /**
     * @description controller for account recovery get method
     * @param {Request} [req]
     * @param {Response} [res]
     */ 
    recovery: async (req,res) => {
        dashboardAuthRenderer.recovery(req,res)
    },
    /**
     * @description controller for account recovery post method
     * @param {Request} [req]
     * @param {Response} [res]
     */ 
    recoveryPost: async (req,res) => {
        try {
            const result = await recoveryHandler.recoveryHandler(req,res)
            if(result.status == recoveryHandler.RecoveryResultStatus.SUCCESS)
                res.redirect("/")
            else
                dashboardAuthRenderer.recoveryPasswordPrompt(req,res,result.confirmCode)
        } catch (error) {
            if (error instanceof recoveryHandler.RecoveryStep1Error)
                return dashboardAuthRenderer.recovery(req,res,error.message)
            else if (error instanceof recoveryHandler.RecoveryStep2Error)
                return dashboardAuthRenderer.recoveryPasswordPrompt(req,res,error.confirmCode,error.message)
            else
                throw error;
        }        
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
        return dashboardAuthRenderer.register(req,res,null,{inviteCode:req.params.invite})
    },
    /**
     * @description controller for account register post method
     * @param {Request} [req]
     * @param {Response} [res]
     */ 
    registerPost: async (req,res) => {
        const errors = validationResult(req);
        const data = matchedData(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
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