import QRCode from "qrcode";
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
   * @description Renders the services dashboard page.
   * Displays a list of clients available in the system.
   * 
   * @param {Request} req - The request object.
   * @param {Response} res - The response object.
   */
  services: (req, res) => {
    return res.render('dashboard/services', {
        title: res.__('Services'),
        clients: adapterService.getEntries("Client")
    });
  },

  /**
  * @description Renders the service management page.
  * Allows the user to manage a specific service, including displaying any errors or pre-filled form data.
  * @param {Request} req - The request object.
  * @param {Response} res - The response object.
  * @param {String} [currentClientId] - The ID of the currently selected client (optional).
  * @param {JSON} [formData] - Data to pre-fill the form (optional).
  * @param {JSON} [errors] - Any validation errors to display (optional).
  */
  manageService: (req, res, currentClientId = null, formData = {}, errors = {}) => {
    return res.render('dashboard/service-management', {
        title: res.__('Manage Service'),
        errors: errors,
        formData: formData,
        currentClientId: currentClientId
    });
  },

  /**
  * @description Renders the user account page.
  * Displays account-related information and options for the user.
  * @param {Request} req - The request object.
  * @param {Response} res - The response object.
  */
  account: (req, res) => {
    return res.render('dashboard/account', {
        title: res.__('Account'),
    });
  },

  /**
  * @description Renders the account password change page.
  * Allows the user to change their account password, displaying any errors or pre-filled data.
  * @param {Request} req - The request object.
  * @param {Response} res - The response object.
  * @param {JSON} [formData] - Data to pre-fill the form (optional).
  * @param {JSON} [errors] - Any validation errors to display (optional).
  */
  accountChangePassword: (req, res, formData = {}, errors = {}) => {
    return res.render('dashboard/account/password', {
        title: res.__('Account Password'),
        errors: errors,
        formData: formData,
    });
  },

  /**
  * @description Renders the two-factor authentication (2FA) settings page.
  * Displays whether 2FA is enabled for the user's account.
  * 
  * @param {Request} req - The request object.
  * @param {Response} res - The response object.
  */
  twoFactorAuth: (req, res) => {
    return res.render('dashboard/account/2fa', {
        title: res.__('Account 2fa'),
        has2fa: accountService.twoFactorAuth.get(req.account) != null
    });
  },

  /**
  * @description Renders the page to add two-factor authentication (2FA) to the account.
  * Generates a QR code for the user to scan, along with a secret key.
  * @param {Request} req - The request object.
  * @param {Response} res - The response object.
  * @param {String} [secret] - The secret key for 2FA (optional).
  * @param {JSON} [formData] - Data to pre-fill the form (optional).
  * @param {JSON} [errors] - Any validation errors to display (optional).
  */
  addTwoFactorAuth: async (req, res, formData = {}, errors = {}) => {
    let secret = formData.providedSecret || twoFactorAuth.generateSecret();
    let url = twoFactorAuth.generateUrl(secret, env.APPLICATION_NAME, req.account.username);
    let qrCodeSrc = await QRCode.toDataURL(url);

    return res.render('dashboard/account/add-2fa', {
      title: res.__('Account 2fa'),
      accountInQuestion: req.account,
      secret: secret,
      url: url,
      qrCodeSrc: qrCodeSrc,
      formData: formData,
      errors: errors
  });
  },

  /**
   * @description Renders the account recovery settings page.
   * Displays the current recovery options associated with the user's account.
   * @param {Request} req - The request object.
   * @param {Response} res - The response object.
   */
  recovery: (req, res) => {
      return res.render('dashboard/account/recovery', {
          title: res.__('Account Recovery'),
          currentRecovery: accountService.recovery.get(req.account)
      });
  },

  /**
   * @description Renders the page to set a recovery token for the account.
   * Displays any existing recovery token and allows the user to generate a new one if needed.
   * @param {Request} req - The request object.
   * @param {Response} res - The response object.
   * @param {JSON} [formData] - Data to pre-fill the form (optional).
   * @param {JSON} [errors] - Any validation errors to display (optional).
   */
  setRecoveryToken: (req, res, formData = {}, errors = {}) => {
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
   * @description Renders the page to set a recovery email for the account.
   * Displays any existing recovery email and allows the user to set a new one.
   * @param {Request} req - The request object.
   * @param {Response} res - The response object.
   * @param {JSON} [formData] - Data to pre-fill the form (optional).
   * @param {JSON} [errors] - Any validation errors to display (optional).
   */
  setRecoveryEmail: (req, res, formData = {}, errors = {}) => {
      return res.render('dashboard/account/set-recovery-email', {
          title: res.__('Account Recovery'),
          errors: errors,
          formData: formData,
          accountInQuestion: req.account,
          hasRecoveryEmail: accountService.recovery.get(req.account)?.email != null
      });
  },

  /**
   * @description Renders a confirmation page for deleting a recovery method.
   * Allows the user to confirm the deletion of a specified recovery method.
   * @param {Request} req - The request object.
   * @param {Response} res - The response object.
   * @param {String} method - The recovery method to be deleted.
   * @param {JSON} [formData] - Data to pre-fill the form (optional).
   * @param {JSON} [errors] - Any validation errors to display (optional).
   */
  deleteRecoveryMethod: (req, res, method, formData = {}, errors = {}) => {
      return res.render('dashboard/account/remove-recovery-confirm', {
          title: res.__('Account Recovery'),
          accountInQuestion: req.account,
          errors: errors,
          formData: formData,
          method: method
      });
  },

  /**
   * @description Renders the account deletion page.
   * Allows the user to confirm the deletion of their account, displaying any errors or pre-filled data.
   * @param {Request} req - The request object.
   * @param {Response} res - The response object.
   * @param {JSON} [formData] - Data to pre-fill the form (optional).
   * @param {JSON} [errors] - Any validation errors to display (optional).
   */
  delete: (req, res, formData = {}, errors = {}) => {
      return res.render('dashboard/account/delete', {
          title: res.__('Delete Account'),
          errors: errors,
          formData: formData,
          accountInQuestion: req.account
      });
  },

  /**
   * @description Renders the invites page.
   * Displays a list of invite codes associated with the user's account, including locked codes.
   * @param {Request} req - The request object.
   * @param {Response} res - The response object.
   */
  invites: (req, res) => {
    return res.render('dashboard/codes', {
      title: res.__('Codes'),
      inviteCodes: invitesService.getForAccount.all(req.account),
      lockedInviteCodes: invitesService.getForAccount.allLocked(req.account)
    });
  },

  /**
  * @description Renders the users management page.
  * Displays a list of all users in the system.
  * @param {Request} req - The request object.
  * @param {Response} res - The response object.
  */
  users: (req, res) => {
    return res.render('dashboard/users', {
        title: res.__('Users'),
        users: accountService.getAll(),
    });
  },

  /**
  * @description Renders the user management page for a specific user.
  * Allows the admin to manage user details, displaying any errors or pre-filled data.
  * @param {Request} req - The request object.
  * @param {Response} res - The response object.
  * @param {String} userId - The ID of the user to be managed.
  * @param {JSON} [formData] - Data to pre-fill the form (optional).
  * @param {JSON} [errors] - Any validation errors to display (optional).
  */
  manageUser: (req, res, userId, formData = {}, errors = {}) => {
    return res.render('dashboard/manage-user', {
        title: res.__('Managing User'),
        errors: errors,
        formData: formData,
        managingAccount: accountService.find.withId(userId),
    });
  },

  /**
  * @description Renders the invite sharing page.
  * Displays the invite link and generates a QR code for the invite URL.
  * @param {Request} req - The request object.
  * @param {Response} res - The response object.
  * @param {String} invite - The invite code to be shared.
  */
  inviteShare: async (req, res, invite) => {
    var inviteURL = env.BASE_URL + "/register/" + invite;
    return res.render('dashboard/invite-share', {
        title: res.__('Inviting'),
        invite: invite,
        inviteURL: inviteURL,
        inviteQR: await QRCode.toDataURL(inviteURL, { width: 300 })
    });
  },
};
