import zxcvbn from "zxcvbn";

import twoFactorAuth from "../helpers/two-factor-auth.js";
import dashboardRenderer from "../renderers/dashboard.renderer.js";
import provider from "../oidc/provider.js";
import accountDriver from "../drivers/account.driver.js";
import emailValidate from "email-validator";

import { isRecoveryToken } from "../helpers/recovery-token-string.js";

/**
 * @typedef {import("express").Request} Request
 */

/**
 * @typedef {import("express").Response} Response
 */

export default {
    /**
     * @description controller function for dashboard service page
     * @param {Response} [res]
     * @param {Request} [req]
     */
    services: (req,res) => {
        dashboardRenderer.services(req,res)
    },
    /**
     * @description controller function for dashboard user account page 
     * @param {Response} [res]
     * @param {Request} [req]
     */
    account: (req,res) => {
        dashboardRenderer.account(req,res)
    },
    /**
     * @description controller function for dashboard user account page 
     * @param {Response} [res]
     * @param {Request} [req]
     */
    accountChangePassword: (req,res) => {
        dashboardRenderer.accountChangePassword(req,res)
    },
    /**
     * @description controller function for dashboard user account page 
     * @param {Response} [res]
     * @param {Request} [req]
     */
    accountChangePasswordPost: async (req,res) => {

        await accountDriver.setPassword(req.account.id,req.body.newPassword)
        res.redirect("/account")

    },
    /**
     * @description controller function for dashboard user account page 
     * @param {Response} [res]
     * @param {Request} [req]
     */
    accountDelete: (req,res) => {
        dashboardRenderer.delete(req,res)
    },
    /**
     * @description controller function for dashboard user account page 
     * @param {Response} [res]
     * @param {Request} [req]
     */
    accountDeletePost: async (req,res) => {
        const session = await provider.Session.get(provider.app.createContext(req,res))
        session.destroy();        
        accountDriver.deleteAccount(req.account.id)
        res.redirect("/")
    },
    /**
     * @description controller function for dashboard user account page 
     * @param {Response} [res]
     * @param {Request} [req]
     */
    account2fa: (req,res) => {
        dashboardRenderer.twoFactorAuth(req,res)
    },
    
    /**
     * @description controller function for dashboard user account page 
     * @param {Response} [res]
     * @param {Request} [req]
     */
    accountAdd2fa: (req,res) => {
        dashboardRenderer.addTwoFactorAuth(req,res)
    },
    /**
     * @description controller function for dashboard user account page 
     * @param {Response} [res]
     * @param {Request} [req]
     */
    accountChange2faPost: (req,res) => {
        accountDriver.setAccount2fa(req.account.id,req.body.secret)
        res.redirect("/account/2fa")
    },
    /**
     * @description controller function for dashboard user account page 
     * @param {Response} [res]
     * @param {Request} [req]
     */
    accountRecovery: (req,res) => {
        dashboardRenderer.recovery(req,res)
    },
    /**
     * @description controller function for dashboard user account page 
     * @param {Response} [res]
     * @param {Request} [req]
     */
    accountRecoverySetEmail: (req,res) => {
        dashboardRenderer.setRecoveryEmail(req,res)
    },
    /**
     * @description controller function for dashboard user account page 
     * @param {Response} [res]
     * @param {Request} [req]
     */
    accountRecoverySetToken: (req,res) => {
        dashboardRenderer.setRecoveryToken(req,res)
    },
    /**
     * @description controller function for dashboard user account page 
     * @param {Response} [res]
     * @param {Request} [req]
     */
    accountRecoveryDeleteEmail: (req,res) => {
        dashboardRenderer.deleteRecoveryMethod(req,res,"email")
    },
    /**
     * @description controller function for dashboard user account page 
     * @param {Response} [res]
     * @param {Request} [req]
     */
    accountRecoveryDeleteToken: (req,res) => {
        dashboardRenderer.deleteRecoveryMethod(req,res,"token")
    },
    /**
     * @description controller function for dashboard invites page
     * @param {Response} [res]
     * @param {Request} [req]
     */
    accountRecoveryDeleteEmailPost: async (req,res) => {
        await accountDriver.setAccountRecoveryEmail(req.account.id,null)
        res.redirect("/account/recovery")
    },
    /**
     * @description controller function for dashboard invites page
     * @param {Response} [res]
     * @param {Request} [req]
     */
    accountRecoveryDeleteTokenPost: async (req,res) => {
        await accountDriver.setAccountRecoveryToken(req.account.id,null)
        res.redirect("/account/recovery")
    },
    /**
     * @description controller function for dashboard invites page
     * @param {Response} [res]
     * @param {Request} [req]
     */
    accountRecoverySetEmailPost: async (req,res) => {
        await accountDriver.setAccountRecoveryEmail(req.account.id,req.body.recoveryEmail)
        res.redirect("/account/recovery")
    },
    /**
     * @description controller function for dashboard invites page
     * @param {Response} [res]
     * @param {Request} [req]
     */
    accountRecoverySetTokenPost: async (req,res) => {
        await accountDriver.setAccountRecoveryToken(req.account.id,req.body.recoveryToken)
        res.redirect("/account/recovery")
    },
    /**
     * @description controller function for dashboard invites page
     * @param {Response} [res]
     * @param {Request} [req]
    */
    invites: (req,res) => {
        dashboardRenderer.invites(req,res)
    },
    /**
     * @description controller function for dashboard invites page
     * @param {Response} [res]
     * @param {Request} [req]
    */
    inviteShare: (req,res) => {
        res.redirect("/invites")
    },
    /**
     * @description controller for invite generation
     * @param {Response} [res]
     * @param {Request} [req]
     */
    invitesGeneratePost: (req,res) => {
        accountDriver.generateInvite(req.account,0,parseInt(req.body.count, 10),req.body.date ? new Date(req.body.date) : null)
        res.redirect("/invites")
    },
    /**
     * @description controller for invite terminatation
     * @param {Response} [res]
     * @param {Request} [req]
     */
    terminateInvite: (req,res) => {
        accountDriver.removeInvite(req.body.code)
        res.redirect("/invites")
    },
}