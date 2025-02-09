import QRCode from "qrcode"

import twoFactorAuth from "../helpers/two-factor-auth.js";
import accountDriver from "../drivers/account.driver.js";

import { generateRecoveryToken } from "../helpers/generate-secrets.js";
import config from "../config.js";

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
        account: req.account,
        clients: config.clients
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
        account: req.account,
        accountInQuestion: req.account,
      });
    },
    /**
     * @description render function for dashboard user account password page 
     * @param {Response} [res]
     * @param {Request} [req]
     * @param {String|undefined} [errorMsg]
     */
    accountChangePassword: (req,res,errorMsg=undefined) => {
      return res.render('dashboard/account/password', {
        title: res.__('Account Password'),
        account: req.account,
        errorMsg:errorMsg,
        accountInQuestion: req.account
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
        account: req.account,
        accountInQuestion: req.account,
        has2fa: accountDriver.get2faSecret(req.account.id) != null
      });
    },
    /**
     * @description render function for dashboard user add 2fa to account page 
     * @param {Response} [res]
     * @param {Request} [req]
     * @param {String} [secret]
     * @param {String|undefined} [errorMsg]
     */
    addTwoFactorAuth: async (req,res,providedSecret=undefined,errorMsg=undefined) => {
      let secret = providedSecret ? providedSecret : twoFactorAuth.generateSecret()
      let url = twoFactorAuth.generateUrl(secret,config.applicationName,req.account.username);
      let qrCodeSrc = await QRCode.toDataURL(url)

      return res.render('dashboard/account/add-2fa', {
        title: res.__('Account 2fa'),
        account: req.account,
        accountInQuestion: req.account,
        secret: secret,
        url:url,
        qrCodeSrc: qrCodeSrc,
        errorMsg: errorMsg
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
        account: req.account,
        currentRecovery: accountDriver.getRecovery(req.account.id)
      });
    },
    /**
     * @description render function for dashboard user manage account recovery page 
     * @param {Response} [res]
     * @param {Request} [req]
     */
    setRecoveryToken: (req,res,errorMsg=undefined,recoveryToken=undefined) => {
      return res.render('dashboard/account/set-recovery-token', {
        title: res.__('Account Recovery'),
        account: req.account,
        accountInQuestion: req.account,
        errorMsg: errorMsg,
        hasRecoveryToken: accountDriver.getRecovery(req.account.id)?.email != null,
        recoveryToken: recoveryToken ? recoveryToken : generateRecoveryToken()
      });
    },
    /**
     * @description render function for dashboard user manage account recovery page 
     * @param {Response} [res]
     * @param {Request} [req]
     */
    setRecoveryEmail: (req,res,errorMsg=undefined) => {
      return res.render('dashboard/account/set-recovery-email', {
        title: res.__('Account Recovery'),
        account: req.account,
        errorMsg: errorMsg,
        accountInQuestion: req.account,
        hasRecoveryEmail: accountDriver.getRecovery(req.account.id)?.email != null
      });
    },
    /**
     * @description render function for dashboard user manage account recovery page 
     * @param {Response} [res]
     * @param {Request} [req]
     */
    deleteRecoveryMethod: (req,res,method,errorMsg=undefined) => {
      return res.render('dashboard/account/remove-recovery-confirm', {
        title: res.__('Account Recovery'),
        account: req.account,
        accountInQuestion: req.account,
        errorMsg: errorMsg,
        method: method
      });
    },
    /**
     * @description render function for user manage account delete
     * @param {Response} [res]
     * @param {Request} [req]
     * @param {String|undefined} [errorMsg
     */
    delete: (req,res,errorMsg=undefined) => {
      return res.render('dashboard/account/delete', {
        title: res.__('Delete Account'),
        account: req.account,
        errorMsg:errorMsg,
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
        account: req.account,
        inviteCodes: req.account.getInvites(),
        lockedInviteCodes: req.account.getLockedInvites(),
        canGenerate: accountDriver.Role.canGenerateInvites(req.account.role)
      });
    },
    /**
     * @description render function for dashboard invites page
     * @param {Response} [res]
     * @param {Request} [req]
     */
    inviteShare: async (req,res,invite) => {
      var inviteURL = config.baseUrl + "/register/"+invite
      return res.render('dashboard/invite-share', {
        title: res.__('Inviting'),
        account: req.account,
        invite: invite,
        inviteURL: inviteURL,
        inviteQR: await QRCode.toDataURL(inviteURL,{width:300})
      });
    },
}