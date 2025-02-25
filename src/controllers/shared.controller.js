import provider from "../oidc/provider.js"

import { matchedData, validationResult } from "express-validator"
import { setProviderSession } from "../oidc/session.js"
import accountDriver from "../drivers/account.driver.js"
import sharedRenderer from "../renderers/shared.renderer.js"

/**
 * @typedef {import("express").Request} Request
 */
/**
 * @typedef {import("express").Response} Response
 */

async function getInteractionDetailsNullable (req,res) {
    try {
        return await provider.interactionDetails(req,res);
    } catch (error) {
        return undefined;
    }
}

async function doLogin (res,req,interactionDetails,accountId) {
    if(interactionDetails)
    {
        await provider.interactionFinished(req,res, {
            login: {
                accountId: accountId,
            },
        }, { mergeWithLastSubmission: false });
    }
    else {
        await setProviderSession(provider,req,res,{accountId: accountId})
        res.redirect("/")
    }

}

export default {
    /**
     * @description controller for account login post method
     * @param {Request} [req]
     * @param {Response} [res]
     */ 
    loginPost: async (req,res) => {
        const interactionDetails = await getInteractionDetailsNullable(req,res)

        if(interactionDetails)
            assert.equal(interactionDetailsprompt.name, 'login');

        const errors = await validationResult(req);
        const data = await matchedData(req);

        if (!errors.isEmpty()) {
            sharedRenderer.login(res,interactionDetails,data,errors.mapped());
        }
        else {

            let account = await accountDriver.checkLogin(data.username,data.password);

            if (account) {
    
                if(accountDriver.get2faSecret(account.id) != null)
                {
                    let token = crypto.randomUUID()
                    req.session.twoFactorLogin = {
                        loginToken: token,
                        accountId: account.id
                    };
                    sharedRenderer.twoFactorAuth(res,interactionDetails,token)
                }
                else {
                    doLogin(res,req,interactionDetails,account.id)
                }    
            }
            else
                throw new Error("Login failed")

        }
    },
    /**
     * @description controller for oidc login post request
     * @param {Request} [req]
     * @param {Response} [res]
     */
    loginSecondFactorPost: async (req,res) => {
        const interactionDetails = await getInteractionDetailsNullable(req,res)

        if(interactionDetails)
            assert.equal(prompt.name, 'login');

        const errors = await validationResult(req);
        const data = await matchedData(req);

        if (!errors.isEmpty()) {
            sharedRenderer.twoFactorAuth(res,interactionDetails,data.twoFactorLoginToken,errors.mapped());
        }
        else {
            let {accountId} = req.session.twoFactorLogin
            let secret = accountDriver.get2faSecret(accountId)
            if(secret == null)
                throw new Error("No 2fa found for user")
            if(twoFactorAuth.verify(secret,data.token))
                doLogin(res,req,interactionDetails,accountId)
            else
                throw new Error("Login failed") 
        }
    },
}