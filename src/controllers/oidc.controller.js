import assert from "assert"

import oidcRenderer from "../renderers/oidc.renderer.js"
import provider from "../oidc/provider.js";

/**
 * @typedef {import("express").Request} Request
 */
/**
 * @typedef {import("express").Response} Response
 */


export default {
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
            return sharedRenderer.login(res,uid)
        }
        case 'consent': {
            return oidcRenderer.consent(req,res,uid,params.clientId)
        }
        default:
            return undefined;
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