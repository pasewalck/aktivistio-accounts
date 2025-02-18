import dashboardAuthRenderer from "../renderers/dashboard.auth.renderer.js"
import provider from "../oidc/provider.js"
import loginHandler from "../handlers/login.handler.js"
import recoveryHandler from "../handlers/recovery.handler.js"
import requestInviteHandler from "../handlers/request-invite.handler.js"
import registerHandler from "../handlers/register.handler.js"

import { setProviderSession } from "../oidc/session.js"

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
        dashboardAuthRenderer.login(req,res)
    },
    /**
     * @description controller for account login post method
     * @param {Request} [req]
     * @param {Response} [res]
     */ 
    loginPost: async (req,res) => {
        try {
            const result = await loginHandler.loginHandler(req)
            if(result.status == loginHandler.LoginResultStatus.SUCCESS)
            {
                await setProviderSession(provider,req,res,{accountId: result.accountId})
                res.redirect("/")
            } 
            else {
                dashboardAuthRenderer.twoFactorAuth(req,res,result.loginToken)
            }
        } catch (error) {
            if (error instanceof loginHandler.Login2faError)
                return dashboardAuthRenderer.twoFactorAuth(req,res,error.loginToken,error.message)
            else if (error instanceof loginHandler.LoginError)
                return dashboardAuthRenderer.login(req,res,error.message)
            else
                throw error;
        }        
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
        try {
            let account = await registerHandler.register(req)
            await setProviderSession(provider,req,res,{accountId: account.id})
            res.redirect('/');
        } catch (error) {
            if (error instanceof registerHandler.RegisterError)
                return dashboardAuthRenderer.register(req,res,error.message,{
                    inviteCode: req.body.inviteCode,
                    username: req.body.username,
                    recoveryMethod: req.body.recoveryMethod,
                    recoveryEmail: req.body.recoveryEmail,
                    recoveryToken: req.body.recoveryToken,
                    confirmedCopiedRecoveryToken: req.body.confirmedCopiedRecoveryToken
                })
            else
                throw error;
        }
    }
}