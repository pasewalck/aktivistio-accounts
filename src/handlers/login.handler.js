import accountDriver from "../drivers/account.driver.js"
import twoFactorAuth from "../helpers/two-factor-auth.js"
/**
 * Enum for login results
 * @readonly
 * @enum {{name: string, id: string}}
 */
/**
 * @class [LoginError registerBadPasswordError]
 */
class LoginError extends Error {
    /**
     * @constructor
     */
    constructor () {
        super("Wrong password or username!")
    }
}
/**
 * @class [LoginResultStatus loginResultStatus]
 */
class LoginResultStatus {
    static SUCCESS = 0;
    static TWO_FACTOR_PROMPT = 1;
}
/**
 * @class [Login2faError login2faError]
 */
class Login2faError extends Error {
    /**
     * @constructor
     * @param {String} [loginToken]
     */
    constructor (loginToken) {
        super("Wrong code submited!")
        this.loginToken = loginToken;

    }
}
/**
 * @description login handler to be used by oidc and default login flow
 * @param {import("express").Request} [req]
 * @returns {JSON}
 */
async function loginHandler(req) {



    if(req.body.twoFactorLoginToken)
    {
        if(!req.session.twoFactorLogin)
            throw new Error("Missing 2fa session")
        let {loginToken,accountId} = req.session.twoFactorLogin
        if(!accountId)
            throw new Error("Missing account id")
        if(!loginToken)
            throw new Error("Missing token")
        if(req.body.twoFactorLoginToken != loginToken)
            throw new Error("Invalid login token")
        let secret = accountDriver.get2faSecret(accountId)
        if(secret == null)
            throw new Error("No 2fa found for user")
        if(!twoFactorAuth.verify(secret,req.body.token))
            throw new Login2faError()    

        

        return {status:LoginResultStatus.SUCCESS,accountId:accountId}

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
            return {status:LoginResultStatus.TWO_FACTOR_PROMPT,loginToken:token}
        }
        else {
            return {status:LoginResultStatus.SUCCESS,accountId:account.id}
        }    
    } else {
        throw new LoginError()
    }

}

export default {
    loginHandler,LoginError,LoginResultStatus,Login2faError
}