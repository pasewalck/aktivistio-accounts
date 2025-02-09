import { generateRecoveryToken } from "../helpers/recovery-token-string.js";

/**
 * @typedef {import("express").Request} Request
 */

/**
 * @typedef {import("express").Response} Response
 */

export default {
    /**
     * @description shared renderer for login page
     * @param {Response} [res]
     * @param {Request} [req]
     * @param {string} [actionUrl]
     * @param {string} [registerUrl]
     * @param {string|undefined} [abortUrl]
     * @param {string|undefined} [errorMsg]
     */
    twoFactorAuth: (req,res,loginToken,actionUrl,abortUrl=undefined,errorMsg=undefined) => {
        return res.render('cards/2fa', {
            title: res.__('Login'),
            urls: {action:actionUrl,abort:abortUrl},
            errorMsg: errorMsg,
            loginToken: loginToken
        });
    },
    /**
     * @description shared renderer for login page
     * @param {Response} [res]
     * @param {Request} [req]
     * @param {string} [actionUrl]
     * @param {string} [registerUrl]
     * @param {string|undefined} [abortUrl]
     * @param {string|undefined} [errorMsg]
     */
    login: (req,res,actionUrl,registerUrl,abortUrl=undefined,errorMsg=undefined,formFields={}) => {
        return res.render('cards/login', {
            title: res.__('Login'),
            urls: {action:actionUrl,register:registerUrl,abort:abortUrl},
            formFields: formFields,
            errorMsg: errorMsg
        });
    },
    /**
     * @description shared renderer for register page
     * @param {Response} [res]
     * @param {Request} [req]
     * @param {string} [actionUrl]
     * @param {string} [loginUrl]
     * @param {string|undefined} [abortUrl]
     * @param {JSON} [formFields]
     */
    register: (req,res,actionUrl,loginUrl,abortUrl=undefined,errorMsg=undefined,formFields={}) => {
        return res.render('cards/register', {
            title: res.__('Register'),
            urls: {action:actionUrl,login:loginUrl,abort:abortUrl},
            formFields: formFields,
            recoveryToken: formFields.recoveryToken ? formFields.recoveryToken : generateRecoveryToken(),
            errorMsg: errorMsg
        });
    }
    
}