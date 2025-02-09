import accountDriver from "../drivers/account.driver.js"
import { generateNumberCode } from "../helpers/generate-secrets.js";
import mailsDriver from "../drivers/mails.driver.js";
import { isRecoveryToken } from "../helpers/recovery-token-string.js";
/**
 * Enum for login results
 * @readonly
 * @enum {{name: string, id: string}}
 */
class RecoveryResultStatus {
    static SUCCESS = 0;
    static RESET_PROMPT = 1;
}
/**
 * @class [LoginError registerBadPasswordError]
 */
class RecoveryStep2Error extends Error {
    /**
     * @constructor
     * @param {String} [message]
     * @param {String} [confirmCode=undefined]
     */
    constructor (message,confirmCode=undefined) {
        super(message)
        this.confirmCode = confirmCode
    }
}
/**
 * @class [Login2faError login2faError]
 */
class RecoveryStep1Error extends Error {
    /**
     * @constructor
     * @param {String} [message]
     */
    constructor (message) {
        super(message)
    }
}
/**
 * @description login handler to be used by oidc and default login flow
 * @param {import("express").Request} [req]
 * @returns {JSON}
 */
async function recoveryHandler(req) {

    if(req.body.confirmCode) {
        if(!req.session.accountRecovery)
            throw new Error("Missing recovery session")
        let {confirmCode,accountId} = req.session.accountRecovery
        if(!accountId)
            throw new Error("Missing account id")
        if(!confirmCode)
            throw new RecoveryStep2Error()
        if(req.body.confirmCode != confirmCode)
            throw new RecoveryStep2Error("Confirm code is wrong")
        if(!req.body.password)
            throw new RecoveryStep2Error("Password missing",confirmCode)
        if(req.body.password != req.body.confirmPassword)
            throw new RecoveryStep2Error("Passwords did not match",confirmCode)
        
        if(!accountDriver.setPassword(accountId,req.body.password))
            throw new Error("Error changing password")
        await accountDriver.setAccount2fa(accountId,null)

        return {status:RecoveryResultStatus.SUCCESS,accountId:accountId}
    } else {
        if(!req.body.username)
            throw new RecoveryStep1Error("Username missing")
        let account = accountDriver.findAccountWithUsername(req.body.username)
        if(!account)
            throw new RecoveryStep1Error("No account for username")
        switch (req.body.method) {
            case "email":
                if (!req.body.email)
                    throw new RecoveryStep1Error("No email for selected email recovery method");
                if (!await accountDriver.checkRecoveryEmail(account.id,req.body.email))
                    throw new RecoveryStep1Error("Email is invalid");
                break;
            case "token":
                if (!req.body.token)
                    throw new RecoveryStep1Error("No token for selected token recovery method");
                if (isRecoveryToken(req.body.token))
                    throw new RecoveryStep1Error("Token format is invalid");
                if (!await accountDriver.checkRecoveryToken(account.id,req.body.token))
                    throw new RecoveryStep1Error("Token is invalid");
                break;
            default:
                throw new RecoveryStep1Error("No valid recovery method selected");
        }

        const confirmCode = generateNumberCode()

        req.session.accountRecovery = {
            confirmCode:confirmCode,
            accountId:account.id
        }

        switch (req.body.method) {
            case "email":
                mailsDriver.sendRecoveryCode(confirmCode,req.body.email)
                return {status:RecoveryResultStatus.RESET_PROMPT}
            case "token":
                return {status:RecoveryResultStatus.RESET_PROMPT,confirmCode:confirmCode}
        }
        

    }

    let account;
    if (account = await accountDriver.checkLogin(req.body.username,req.body.password)) {
        if(accountDriver.get2faSecret(account.id) != null)
        {
            let token = crypto.randomUUID()
            req.session.twoFactorLogin = {
                loginToken: token,
                accountId: account.id
            };
            return {status:RecoveryResultStatus.TWO_FACTOR_PROMPT,loginToken:token}
        }
        else {
            return {status:RecoveryResultStatus.SUCCESS,accountId:account.id}
        }    
    } else {
        throw new LoginError()
    }

}

export default {
    recoveryHandler,RecoveryResultStatus,RecoveryStep1Error,RecoveryStep2Error
}