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
        if(!req.body.currentPassword || !req.body.newPassword || !req.body.confirmNewPassword)
            return dashboardRenderer.accountChangePassword(req,res,"Missing fields")
        if (!await accountDriver.checkPassword(req.account.id,req.body.currentPassword))
            return dashboardRenderer.accountChangePassword(req,res,"Provided Password is not correct")
        if (req.body.newPassword != req.body.confirmNewPassword)
            return dashboardRenderer.accountChangePassword(req,res,"Confirm Password doesn't match")
        let passwordStrg = zxcvbn(password);
        if (passwordStrg.score < 3)
            return dashboardRenderer.accountChangePassword(req,res,"Password is not secure enough")
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
        if(!req.body.password)
            return dashboardRenderer.delete(req,res,"Missing password")
        else if (!await accountDriver.checkPassword(req.account.id,req.body.password))
            return dashboardRenderer.delete(req,res,"Provided Password is not correct")
        else if (!req.body.confirm)
            return dashboardRenderer.delete(req,res,"Missing confirmation")
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
        if(req.body.secret)
        {
            if(!req.body.token)
                return dashboardRenderer.addTwoFactorAuth(req,res,req.body.secret,"Missing token")
            if (!twoFactorAuth.verify(req.body.secret,req.body.token))
                return dashboardRenderer.addTwoFactorAuth(req,res,req.body.secret,"Token not matching")
        }
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
        if(!req.body.currentPassword)
            return dashboardRenderer.deleteRecoveryMethod(req,res,"token","Missing fields")
        if (!await accountDriver.checkPassword(req.account.id,req.body.currentPassword))
            return dashboardRenderer.deleteRecoveryMethod(req,res,"token","Provided Password is not correct")
        await accountDriver.setAccountRecoveryEmail(req.account.id,null)
        res.redirect("/account/recovery")
    },
    /**
     * @description controller function for dashboard invites page
     * @param {Response} [res]
     * @param {Request} [req]
     */
    accountRecoveryDeleteTokenPost: async (req,res) => {
        if(!req.body.currentPassword)
            return dashboardRenderer.deleteRecoveryMethod(req,res,"token","Missing fields")
        if (!await accountDriver.checkPassword(req.account.id,req.body.currentPassword))
            return dashboardRenderer.deleteRecoveryMethod(req,res,"token","Provided Password is not correct")
        await accountDriver.setAccountRecoveryToken(req.account.id,null)
        res.redirect("/account/recovery")
    },
    /**
     * @description controller function for dashboard invites page
     * @param {Response} [res]
     * @param {Request} [req]
     */
    accountRecoverySetEmailPost: async (req,res) => {
        if(!req.body.currentPassword || !req.body.recoveryEmail)
            return dashboardRenderer.setRecoveryEmail(req,res,"Missing fields")
        if(!emailValidate.validate(req.body.recoveryEmail))
            return dashboardRenderer.setRecoveryEmail(req,res,"Email is not valid")
        if (!await accountDriver.checkPassword(req.account.id,req.body.currentPassword))
            return dashboardRenderer.setRecoveryEmail(req,res,"Provided Password is not correct")
        await accountDriver.setAccountRecoveryEmail(req.account.id,req.body.recoveryEmail)
        res.redirect("/account/recovery")
    },
    /**
     * @description controller function for dashboard invites page
     * @param {Response} [res]
     * @param {Request} [req]
     */
    accountRecoverySetTokenPost: async (req,res) => {
        if(!req.body.currentPassword || !req.body.recoveryToken)
            return dashboardRenderer.setRecoveryToken(req,res,"Missing fields",req.body.recoveryToken)
        if (!await accountDriver.checkPassword(req.account.id,req.body.currentPassword))
            return dashboardRenderer.setRecoveryToken(req,res,"Provided Password is not correct",req.body.recoveryToken)
        if(!isRecoveryToken(req.body.recoveryToken))
            return dashboardRenderer.setRecoveryEmail(req,res,"Invalid recovery token")
        if(!req.body.recoveryTokenVerify)
            return dashboardRenderer.setRecoveryToken(req,res,"Missing confirmation for recovery token",req.body.recoveryToken)
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
        if(req.params.invite)
            dashboardRenderer.inviteShare(req,res,req.params.invite)
        else
            res.redirect("/invites")
    },
    /**
     * @description controller fpr invite generation
     * @param {Response} [res]
     * @param {Request} [req]
     */
    invitesGeneratePost: (req,res) => {
        if(!req.body.count || !(req.body.count == parseInt(req.body.count, 10)))
            throw Error("Missing fields or invalid")

        if(!accountDriver.Role.canGenerateInvites(req.account.role))
            throw Error("Missing permissions for invite generation")
        accountDriver.generateInvite(req.account,0,parseInt(req.body.count, 10),req.body.date ? new Date(req.body.date) : null)
        res.redirect("/invites")

    },
}