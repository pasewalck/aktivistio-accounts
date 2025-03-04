import dashboardRenderer from "../renderers/dashboard.renderer.js";
import provider from "../oidc/provider.js";
import { matchedData, validationResult } from "express-validator";
import accountService from "../services/account.service.js";
import invitesService from "../services/invites.service.js";

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

        const errors = await validationResult(req);
        const data = await matchedData(req);

        if (!errors.isEmpty()) {
            return dashboardRenderer.accountChangePassword(req,res,data,errors.mapped())
        }

        await accountService.password.set(req.account,data.newPassword)
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
        const errors = await validationResult(req);
        const data = await matchedData(req);

        if (!errors.isEmpty()) {
            return dashboardRenderer.delete(req,res,data,errors.mapped())
        }

        const session = await provider.Session.get(provider.app.createContext(req,res))
        session.destroy();        
        accountService.delete(req.account)
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
    accountChange2faPost: async (req,res) => {
        const errors = await validationResult(req);
        const data = await matchedData(req);

        if (!errors.isEmpty()) {
            return dashboardRenderer.addTwoFactorAuth(req,res,data,errors.mapped())
        }

        accountService.twoFactorAuth.set(req.account,req.body.secret)
        res.redirect("/account/2fa")
    },
    /**
     * @description controller function for dashboard user account page 
     * @param {Response} [res]
     * @param {Request} [req]
     */
    accountRemove2faPost: async (req,res) => {
        accountService.twoFactorAuth.set(req.account,null)
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
        const errors = await validationResult(req);
        const data = await matchedData(req);

        if (!errors.isEmpty()) {
            return dashboardRenderer.deleteRecoveryMethod(req,res,"email",data,errors.mapped())
        }

        await accountService.recovery.email.set(req.account,null)
        res.redirect("/account/recovery")
    },
    /**
     * @description controller function for dashboard invites page
     * @param {Response} [res]
     * @param {Request} [req]
     */
    accountRecoveryDeleteTokenPost: async (req,res) => {
        const errors = await validationResult(req);
        const data = await matchedData(req);

        if (!errors.isEmpty()) {
            return dashboardRenderer.deleteRecoveryMethod(req,res,"email",data,errors.mapped())
        }

        await accountService.recovery.token.set(req.account,null)
        res.redirect("/account/recovery")
    },
    /**
     * @description controller function for dashboard invites page
     * @param {Response} [res]
     * @param {Request} [req]
     */
    accountRecoverySetEmailPost: async (req,res) => {
        const errors = await validationResult(req);
        const data = await matchedData(req);

        if (!errors.isEmpty()) {
            return dashboardRenderer.setRecoveryEmail(req,res,data,errors.mapped())
        }

        await accountService.recovery.email.set(req.account,data.email)
        res.redirect("/account/recovery")
    },
    /**
     * @description controller function for dashboard invites page
     * @param {Response} [res]
     * @param {Request} [req]
     */
    accountRecoverySetTokenPost: async (req,res) => {
        const errors = await validationResult(req);
        const data = await matchedData(req);

        if (!errors.isEmpty()) {
            return dashboardRenderer.setRecoveryToken(req,res,data,errors.mapped())
        }

        await accountService.recovery.token.set(req.account,req.body.token)
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
    inviteShare: async (req,res) => {
        const errors = await validationResult(req);
        const data = await matchedData(req);

        if (!errors.isEmpty()) {
            throw new Error(errors.array()[0].msg)
        }

        dashboardRenderer.inviteShare(req,res,data.invite)
    },
    /**
     * @description controller for invite generation
     * @param {Response} [res]
     * @param {Request} [req]
     */
    invitesGeneratePost: async (req,res) => {
        const errors = await validationResult(req);
        const data = await matchedData(req);

        if (!errors.isEmpty()) {
            throw new Error(errors.array()[0].msg)
        }

        invitesService.generate.single({maxUses:parseInt(data.count, 10),linkedAccount:req.account,expireDate:data.date ? data.date : null})
        res.redirect("/invites")
    },
    /**
     * @description controller for invite terminatation
     * @param {Response} [res]
     * @param {Request} [req]
     */
    terminateInvitePost: async (req,res) => {
        const errors = await validationResult(req);
        const data = await matchedData(req);

        if (!errors.isEmpty()) {
            throw new Error(errors.array()[0].msg)
        }

        invitesService.remove(data.code)
        res.redirect("/invites")
    },
    serviceAdd: async (req,res) => {
        dashboardRenderer.serviceManage(req,res)
    },
    serviceEdit: async (req,res) => {
        dashboardRenderer.serviceManage(req,res)
    },
    serviceEditSavePost: async (req,res) => {
    },
    serviceEditDeletePost: async (req,res) => {
    },
    users: async (req,res) => {
        dashboardRenderer.users(req,res)
    },
    manageUser: async (req,res) => {
        const errors = await validationResult(req);
        const data = await matchedData(req);

        if (!errors.isEmpty()) {
            throw new Error(errors.array()[0].msg)
        }

        dashboardRenderer.manageUser(req,res,data.id)
    },
    manageUserUpdatePost: async (req,res) => {
        const errors = await validationResult(req);
        const data = await matchedData(req);

        if (!errors.isEmpty()) {
            return dashboardRenderer.manageUser(req,res,data.id,data,errors.mapped())
        }

        accountService.setRole(accountService.find.withId(data.id),data.accountUpdateRole)

        res.redirect(`/user/${data.id}/`)
    },
    manageUserDeletePost: async (req,res) => {
        const errors = await validationResult(req);
        const data = await matchedData(req);

        console.log(errors.array())

        if (!errors.isEmpty()) {
            return dashboardRenderer.manageUser(req,res,data.id,data,errors.mapped())
        }

        accountService.delete(accountService.find.withId(data.id))

        res.redirect("/users/")

    },
}