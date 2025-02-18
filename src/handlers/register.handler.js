import zxcvbn from 'zxcvbn';
import emailValidate from "email-validator";

import accountDriver from "../drivers/account.driver.js"
import config from '../config.js';
import { isRecoveryToken } from '../helpers/recovery-token-string.js';
import { isAlphanumeric, isAlphanumericLowerCase, isInLengthRange } from '../helpers/validate-strings.js';

/**
 * Represents an error causable when registeing a user.
 * @class [RegisterError registerError]
 */
class RegisterError extends Error {
    /**
     * @constructor
     * @param {String} [message]
     */
    constructor(message) {
        super(message);
        this.name = "RegisterError";
    }
}
/**
 * @class [RegisterBadPasswordError registerBadPasswordError]
 */
class RegisterBadPasswordError extends RegisterError {
    /**
     * @constructor
     * @param {Number} [score]
     * @param {String} [feedback]
     */
    constructor(score,feedback) {
        super("The selected password is not secure enough");
        this.name = "RegisterBadPasswordError";
        this.score = score
        this.feedback = feedback
    }
}
/**
 * @typedef {JSON} AccountRecovery
 * @property {String} method
 * @property {String|undefined} email
 * @property {String|undefined} token
*/

/**
 * @description handler for registering a user
 * @param {import("express").Request} [req]
 * @returns {Account}
 */
async function registerHandler (req) {

    const {username,password,passwordConfirm,inviteCode} = req.body
    const recovery = {
        method: req.body.recoveryMethod,
        token: req.body.recoveryToken,
        email: req.body.recoveryEmail,
        tokenVerify: req.body.recoveryTokenVerify
    }
    if (!username || !password || !password || !passwordConfirm || !inviteCode || !recovery)
        throw new RegisterError("Missing fields");
    if (password != passwordConfirm)
        throw new RegisterError("Password doesn't match confirm password");
    let passwordStrg = zxcvbn(password);
    if (passwordStrg.score < 3)
        throw new RegisterBadPasswordError(passwordStrg.score,passwordStrg.feedback);
    if (!isAlphanumericLowerCase(username))
        throw new RegisterError("Username contains invalid characters");
    if (!isInLengthRange(username,3,20))
        throw new RegisterError("Username is too long or short. Must be between 3 and 20 characters long.");
    if (!isAlphanumeric(inviteCode) || !accountDriver.validateInvite(inviteCode))
        throw new RegisterError("Invalid invite");
    if (accountDriver.findAccountWithUsername(username))
        throw new RegisterError("User with username exists");
    switch (recovery.method) {
        case "email":
            if (!recovery.email)
                throw new RegisterError("No email for selected email recovery method");
            if(!emailValidate.validate(recovery.email))
                throw new RegisterError("Recovery email is not valid")
            break;
        case "token":
            if (!recovery.token)
                throw new RegisterError("No token for selected token recovery method");
            if (!isRecoveryToken(recovery.token))
                throw new RegisterError("Recovery Token is not in valid format");
            if (!recovery.tokenVerify)
                throw new RegisterError("Recovery Token not confirmed");
            break;
        default:
            throw new RegisterError("No valid recovery method selected");
    }

    // After all checks passed, create accounty add recovery methods and we consume invite

    let account = await accountDriver.createAccount(username,password,accountDriver.Role.USER)

    switch (recovery.method) {
        case "email":
            accountDriver.setAccountRecovery(account.id,recovery.email,undefined)
            break;
        case "token":
            accountDriver.setAccountRecovery(account.id,undefined,recovery.token)  
            break;
    }

    accountDriver.consumeInvite(inviteCode)

    for (let i = 0; i < config.inviteCodes.newUsers.count; i++)
        accountDriver.generateInvite(account,config.inviteCodes.newUsers.waitDays)

    return account
}

export default {
    register: registerHandler,RegisterBadPasswordError,RegisterError
}