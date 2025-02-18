import emailValidate from "email-validator";

import accountDriver from "../drivers/account.driver.js"
import mailsDriver from "../drivers/mails.driver.js";
import config from "../config.js";
/**
 * @class [RequestInviteError requestInviteError]
 */
class RequestInviteError extends Error {
    /**
     * @constructor
     * @param {String} [message]
     */
    constructor (message) {
        super(message)
    }
}

/**
 * @description handler for requesting an invite
 * @param {import("express").Request} [req]
 * @param {import("express").Response} [res]
 */
async function requestInviteHandler(req,res) {

    const email = req.body.email;
    if(!email)
        throw new RequestInviteError("Missing request email")
    if(!emailValidate.validate(email))
        throw new RequestInviteError("Email is not valid")
    const emailEnding = email.split("@")[1]
    if(!config.invitingMailProviders.includes(emailEnding))
        throw new RequestInviteError("Email provider is not whitelisted")

    var inviteCode;
    if(inviteCode = await accountDriver.requestInvite(email))
    {
        mailsDriver.sendInviteCode(inviteCode,email,res.locals)        
    }
    else
        throw new RequestInviteError("Invite code already requested")

    
}

export default {
    requestInviteHandler,RequestInviteError
}