import jose from 'node-jose';

import logger from "../helpers/logger.js";
import secretService from "../services/secret.service.js";
import { emulatedEjs } from '../helpers/ejs-render.js';
import env from '../helpers/env.js';

const emulatedEjsInstance = await emulatedEjs()

function render (path,data,title,ctx) {
  return emulatedEjsInstance.render(path,{
    title:title,
    baseUrl:env.BASE_URL,
    app: { name: env.APPLICATION_NAME, logo: env.APPLICATION_LOGO },
    ...ctx.res.locals,
    ...data})
}

export default {
    features: {
        devInteractions: { enabled: false },
        rpInitiatedLogout: {
          enabled:true,
          logoutSource: async (ctx, form) => {
            ctx.body = (await render("cards/logout",{secret:ctx.oidc.session.state.secret},ctx.res.__('Logout'),ctx))
          },
          postLogoutSuccessSource: async (ctx) => {
            ctx.res.redirect("/")
          }
        }
    },
    renderError: async function renderError(ctx, out, error) {
      ctx.type = 'html';
      logger.error(error)
      ctx.body = (await render("cards/error",{error:error},ctx.res.__('Error'),ctx))
    },
    conformIdTokenClaims: false,
    claims: {
      email: ['email'],
      profile: ['name'],
    },
    pkce: {
      required: () => false,
    },
    jwks: {
      keys: await secretService.getEntries("OPEN_ID_JWKS",async () => {
        const keyStore = jose.JWK.createKeyStore();
        const result = await keyStore.generate("RSA", 2048, { alg: "RS256", use: "sig" })
        return keyStore.toJSON(true).keys[0];
      },{lifeTime:365,graceTime:30})
    },
    cookies: {
      keys: ["subzero"],
    },
    ttl: {
      AccessToken: function AccessTokenTTL(ctx, token, client) {
        if (token.resourceServer) {
          return token.resourceServer.accessTokenTTL || 60 * 60; // 1 hour in seconds
        }
        return 60 * 60; // 1 hour in seconds
      },
      AuthorizationCode: 600 /* 10 minutes in seconds */,
      BackchannelAuthenticationRequest:
        function BackchannelAuthenticationRequestTTL(ctx, request, client) {
          if (ctx && ctx.oidc && ctx.oidc.params?.requested_expiry) {
            return Math.min(10 * 60, ctx.oidc.params?.requested_expiry); // 10 minutes in seconds or requested_expiry, whichever is shorter
          }
          return 10 * 60; // 10 minutes in seconds
        },
      ClientCredentials: function ClientCredentialsTTL(ctx, token, client) {
        if (token.resourceServer) {
          return token.resourceServer.accessTokenTTL || 10 * 60; // 10 minutes in seconds
        }
        return 10 * 60; // 10 minutes in seconds
      },
      DeviceCode: 600 /* 10 minutes in seconds */,
      Grant: 1209600 /* 14 days in seconds */,
      IdToken: 3600 /* 1 hour in seconds */,
      Interaction: 3600 /* 1 hour in seconds */,
      RefreshToken: function RefreshTokenTTL(ctx, token, client) {
        if (
          ctx &&
          ctx.oidc.entities.RotatedRefreshToken &&
          client.applicationType === "web" &&
          client.tokenEndpointAuthMethod === "none" &&
          !token.isSenderConstrained()
        ) {
          // Non-Sender Constrained SPA RefreshTokens do not have infinite expiration through rotation
          return ctx.oidc.entities.RotatedRefreshToken.remainingTTL;
        }
        return 14 * 24 * 60 * 60; // 14 days in seconds
      },
      Session: 1209600 /* 14 days in seconds */,
    },
  };
  