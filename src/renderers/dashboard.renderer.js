import QRCode from "qrcode"

import { generateRecoveryToken } from "../helpers/recovery-token-string.js";

import twoFactorAuth from "../helpers/two-factor-auth.js";
import accountService from "../services/account.service.js";
import env from "../helpers/env.js";
import adapterService from "../services/adapter.service.js";
import invitesService from "../services/invites.service.js";

/**
 * @typedef {import("express").Request} Request
 * @property {import("../drivers/account.driver.js").Account} account
 */

/**
 * @typedef {import("express").Response} Response
 */

export default {
    /**
     * @description render function for dashboard service page
     * @param {Response} [res]
     * @param {Request} [req]
     */
    services: (req,res) => {
      return res.render('dashboard/services', {
        title: res.__('Services'),
        clients: adapterService.getEntries("Client")
      });
    },
    /**
     * @description render function for dashboard service page
     * @param {Response} [res]
     * @param {Request} [req]
     * @param {String} [currentClientId]
     * @param {JSON} [formData]
     * @param {JSON} [errors]
     */
    manageService: (req,res,currentClientId=null,formData={},errors={}) => {
      return res.render('dashboard/service-management', {
        title: res.__('Manage Service'),
        errors:errors,
        formData:formData,
        currentClientId:currentClientId
      });
    },
    /**
     * @description render function for dashboard user account page 
     * @param {Response} [res]
     * @param {Request} [req]
     */
    account: (req,res) => {
      return res.render('dashboard/account', {
        title: res.__('Account'),
      });
    },
    /**
     * @description render function for dashboard user account password page 
     * @param {Response} [res]
     * @param {Request} [req]
     * @param {JSON} [formData]
     * @param {JSON} [errors]
     */
    accountChangePassword: (req,res,formData={},errors={}) => {
      console.log(errors)
      return res.render('dashboard/account/password', {
        title: res.__('Account Password'),
        errors:errors,
        formData:formData,
      });
    },
    /**
     * @description render function for dashboard user account 2fa page 
     * @param {Response} [res]
     * @param {Request} [req]
     */
    twoFactorAuth: (req,res) => {
      return res.render('dashboard/account/2fa', {
        title: res.__('Account 2fa'),
        has2fa: accountService.twoFactorAuth.get(req.account) != null
      });
    },
    /**
     * @description render function for dashboard user add 2fa to account page 
     * @param {Response} [res]
     * @param {Request} [req]
     * @param {String} [secret]
     * @param {JSON} [formData]
     * @param {JSON} [errors]
     */
    addTwoFactorAuth: async (req,res,formData={},errors={}) => {
      let secret = formData.providedSecret || twoFactorAuth.generateSecret()
      let url = twoFactorAuth.generateUrl(secret,env.APPLICATION_NAME,req.account.username);
      let qrCodeSrc = await QRCode.toDataURL(url)

      return res.render('dashboard/account/add-2fa', {
        title: res.__('Account 2fa'),
        accountInQuestion: req.account,
        secret: secret,
        url:url,
        qrCodeSrc: qrCodeSrc,
        formData: formData,
        errors: errors
      });
    },
    /**
     * @description render function for dashboard user manage account recovery page 
     * @param {Response} [res]
     * @param {Request} [req]
     */
    recovery: (req,res) => {
      return res.render('dashboard/account/recovery', {
        title: res.__('Account Recovery'),
        currentRecovery: accountService.recovery.get(req.account)
      });
    },
    /**
     * @description render function for dashboard user manage account recovery page 
     * @param {Response} [res]
     * @param {Request} [req]
     * @param {JSON} [formData]
     * @param {JSON} [errors]
     */
    setRecoveryToken: (req,res,formData={},errors={}) => {
      return res.render('dashboard/account/set-recovery-token', {
        title: res.__('Account Recovery'),
        accountInQuestion: req.account,
        errors: errors,
        formData: formData,
        hasRecoveryToken: accountService.recovery.get(req.account)?.token != null,
        recoveryToken: formData.token || generateRecoveryToken()
      });
    },
    /**
     * @description render function for dashboard user manage account recovery page 
     * @param {Response} [res]
     * @param {Request} [req]
     * @param {JSON} [formData]
     * @param {JSON} [errors]
     */
    setRecoveryEmail: (req,res,formData={},errors={}) => {
      return res.render('dashboard/account/set-recovery-email', {
        title: res.__('Account Recovery'),
        errors: errors,
        formData: formData,
        accountInQuestion: req.account,
        hasRecoveryEmail: accountService.recovery.get(req.account)?.email != null
      });
    },
    /**
     * @description render function for dashboard user manage account recovery page 
     * @param {Response} [res]
     * @param {Request} [req]
     * @param {JSON} [formData]
     * @param {JSON} [errors]
     */
    deleteRecoveryMethod: (req,res,method,formData={},errors={}) => {
      return res.render('dashboard/account/remove-recovery-confirm', {
        title: res.__('Account Recovery'),
        accountInQuestion: req.account,
        errors: errors,
        formData: formData,
        method: method
      });
    },
    /**
     * @description render function for user manage account delete
     * @param {Response} [res]
     * @param {Request} [req]
     * @param {JSON} [formData]
     * @param {JSON} [errors]
     */
    delete: (req,res,formData={},errors={}) => {
      return res.render('dashboard/account/delete', {
        title: res.__('Delete Account'),
        errors:errors,
        formData:formData,
        accountInQuestion: req.account
      });
    },
    /**
     * @description render function for dashboard invites page
     * @param {Response} [res]
     * @param {Request} [req]
     */
    invites: (req,res) => {
      return res.render('dashboard/codes', {
        title: res.__('Codes'),
        inviteCodes: invitesService.getForAccount.all(req.account),
        lockedInviteCodes: invitesService.getForAccount.allLocked(req.account)
      });
    },
    /**
     * @description
     * @param {Response} [res]
     * @param {Request} [req]
     */
    users: (req,res) => {
      return res.render('dashboard/users', {
        title: res.__('Users'),
        users: accountService.getAll(),
      });
    },
    /**
     * @description
     * @param {Response} [res]
     * @param {Request} [req]
     */
    manageUser: (req,res,userId,formData={},errors={}) => {
      return res.render('dashboard/manage-user', {
        title: res.__('Managing User'),
        errors: errors,
        formData: formData,
        managingAccount: accountService.find.withId(userId),
      });
    },
    /**
     * @description render function for dashboard invites page
     * @param {Response} [res]
     * @param {Request} [req]
     */
    inviteShare: async (req,res,invite) => {
      var inviteURL = env.BASE_URL + "/register/"+invite
      return res.render('dashboard/invite-share', {
        title: res.__('Inviting'),

        invite: invite,
        inviteURL: inviteURL,
        inviteQR: await QRCode.toDataURL(inviteURL,{width:300})
      });
    },
}