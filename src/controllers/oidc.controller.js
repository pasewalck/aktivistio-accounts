import assert from "assert"

import oidcRenderer from "../renderers/oidc.renderer.js"
import provider from "../oidc/provider.js";
import loginHandler from "../handlers/login.handler.js";
import registerHandler from "../handlers/register.handler.js";

/**
 * @typedef {import("express").Request} Request
 */
/**
 * @typedef {import("express").Response} Response
 */


export default {
    /**
     * @description controller for oidc logout page
     * @param {Request} [req]
     * @param {Response} [res]
     */
    logout: async (req,res) => {
        const ctx = provider.app.createContext(req,res)
        const session = await provider.Session.get(ctx)
    
        return oidcRenderer.logout(req,res,session.state.secret,session.state.clientId)
    },
    /**
     * @description controller for oidc interation page
     * @param {Request} [req]
     * @param {Response} [res]
     */
    interaction: async (req,res) => {
        const {
            uid, prompt, params,
        } = await provider.interactionDetails(req,res);
                
        switch (prompt.name) {
        case 'login': {
            return oidcRenderer.login(req,res,uid)
        }
        case 'consent': {
            return oidcRenderer.consent(req,res,uid,params.clientId)
        }
        default:
            return undefined;
        }
    },    
    /**
     * @description controller for oidc register page
     * @param {Request} [req]
     * @param {Response} [res]
     */
    register: async (req,res) => {
        const {
            uid
        } = await provider.interactionDetails(req,res);
    
        return oidcRenderer.register(req,res,uid)
    },
    /**
     * @description controller for oidc register post request
     * @param {Request} [req]
     * @param {Response} [res]
     */
    registerPost: async (req,res) => {
        const {uid,prompt} = await provider.interactionDetails(req,res);
        
        assert.equal(prompt.name, 'login');

        try {
            let account = await registerHandler.register(req)
            await provider.interactionFinished(req,res, {
                    login: {accountId: account.id},
                }, { mergeWithLastSubmission: false });
        } catch (error) {
            if (err instanceof registerHandler.RegisterError)
                return oidcRenderer.register(req,res,uid,err.message,{
                    inviteCode: req.body.inviteCode,
                    username: req.body.username,
                    recoveryMethod: req.body.recoveryMethod,
                    recoveryEmail: req.body.recoveryEmail,
                    recoveryToken: req.body.recoveryToken,
                    confirmedCopiedRecoveryToken: req.body.confirmedCopiedRecoveryToken
                })
            else
                throw err;
        }
    },
    /**
     * @description controller for oidc login post request
     * @param {Request} [req]
     * @param {Response} [res]
     */
    loginPost: async (req,res) => {
        const {prompt,uid} = await provider.interactionDetails(req,res);
    
        assert.equal(prompt.name, 'login');
        
        try {
            const result = await loginHandler.loginHandler(req)
            if(result.status == loginHandler.LoginResultStatus.SUCCESS)
            {
                await provider.interactionFinished(req,res, {
                    login: {
                        accountId: result.accountId,
                    },
                }, { mergeWithLastSubmission: false });
            } 
            else {
                oidcRenderer.twoFactorAuth(req,res,result.loginToken,uid)
            }
        } catch (error) {
            if (error instanceof loginHandler.Login2faError)
                return oidcRenderer.twoFactorAuth(req,res,error.loginToken,uid,error.message)
            else if (error instanceof loginHandler.LoginError)
                return oidcRenderer.login(req,res,uid,error.message)
            else
                throw error;
        }        
    },
    /**
     * @description controller for oidc confirm post request
     * @param {Request} [req]
     * @param {Response} [res]
     */
    confirmPost: async (req,res) => {
        const interactionDetails = await provider.interactionDetails(req,res);
        const { prompt: { name, details }, params, session: { accountId } } = interactionDetails;

        assert.equal(name, 'consent');
    
        let { grantId } = interactionDetails;
        let grant;
    
        if (grantId) {
          grant = await provider.Grant.find(grantId);
        } else {
          grant = new provider.Grant({
            accountId,
            clientId: params.client_id,
          });
        }
    
        if (details.missingOIDCScope) {
          grant.addOIDCScope(details.missingOIDCScope.join(' '));
        }
        if (details.missingOIDCClaims) {
          grant.addOIDCClaims(details.missingOIDCClaims);
        }
        if (details.missingResourceScopes) {
          for (const [indicator, scopes] of Object.entries(details.missingResourceScopes)) {
            grant.addResourceScope(indicator, scopes.join(' '));
          }
        }
  
        grantId = await grant.save();
    
        const consent = {};
        if (!interactionDetails.grantId) {
          consent.grantId = grantId;
        }
    
        const result = { consent };
        await provider.interactionFinished(req,res, result, { mergeWithLastSubmission: true });
    },
    /**
     * @description controller for oidc abort get request
     * @param {Request} [req]
     * @param {Response} [res]
     */ 
    abort: async (req,res) => {
        const result = {
            error: 'access_denied',
            error_description: 'End-User aborted interaction',
        };
        await provider.interactionFinished(req,res, result, { mergeWithLastSubmission: false });
    },
      
}