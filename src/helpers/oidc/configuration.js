import jose from 'node-jose';
import logger from "../logger.js";
import secretService from "../../services/secret.service.js";
import { emulatedEjs } from '../ejs-render.js';
import env from '../env.js';
import { assembleUrl, extendUrl } from '../url.js';
import { generateAsciiSecret } from '../../helpers/generate-secrets.js';

// Initialize the emulated EJS instance for rendering templates
const emulatedEjsInstance = await emulatedEjs();

/**
 * @description Renders a template with the provided data and context.
 * @param {string} path - The path to the template.
 * @param {object} data - The data to be passed to the template.
 * @param {string} title - The title for the rendered page.
 * @param {object} ctx - The context object containing response locals.
 * @returns {Promise<string>} - The rendered HTML as a string.
 */
function render(path, data, title, ctx) {
    return emulatedEjsInstance.render(path, {
        title: title,
        baseUrl: env.BASE_URL,
        urlUtils: {
            assembleUrl,
            extendUrl
        },
        app: { name: env.APPLICATION_NAME, logo: env.APPLICATION_LOGO },
        ...ctx.res.locals,
        ...data
    });
}

export default {
    features: {
        devInteractions: { enabled: false },
        rpInitiatedLogout: {
            enabled: true,
            logoutSource: async (ctx, form) => {
                // Render the logout card with the session secret
                ctx.body = await render("pages/oidc/logout", { secret: ctx.oidc.session.state.secret }, ctx.res.__('Logout'), ctx);
            },
            postLogoutSuccessSource: async (ctx) => {
                // Redirect to the home page after logout
                ctx.res.redirect("/");
            }
        }
    },
    renderError: async function renderError(ctx, out, error) {
        ctx.type = 'html';
        logger.error(error); // Log the error for debugging
        // Render the error card with the error message
        ctx.body = await render("pages/shared/error", { error: error }, ctx.res.__('Error'), ctx);
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
        keys: await secretService.getEntries("OPEN_ID_JWKS", async () => {
            const keyStore = jose.JWK.createKeyStore();
            // Generate a new RSA key for signing
            const result = await keyStore.generate("RSA", 2048, { alg: "RS256", use: "sig" });
            return keyStore.toJSON(true).keys[0]; // Return the generated private key
        }, { lifeTime: 365, graceTime: 30 })
    },
    cookies: {
        keys: await secretService.getEntries("COOKIE_KEYS", () => generateAsciiSecret(40), { lifeTime: 365, graceTime: 30 }), // Define cookie keys
    },
    ttl: {
        AccessToken: function AccessTokenTTL(ctx, token, client) {
            // Determine the TTL for Access Tokens based on resource server settings
            return token.resourceServer ? token.resourceServer.accessTokenTTL || 60 * 60 : 60 * 60; // Default to 1 hour
        },
        AuthorizationCode: 600, // 10 minutes in seconds
        BackchannelAuthenticationRequest: function BackchannelAuthenticationRequestTTL(ctx, request, client) {
            // Determine the TTL for Backchannel Authentication Requests
            if (ctx && ctx.oidc && ctx.oidc.params?.requested_expiry) {
                return Math.min(10 * 60, ctx.oidc.params.requested_expiry); // Use the shorter of 10 minutes or requested expiry
            }
            return 10 * 60; // Default to 10 minutes
        },
        ClientCredentials: function ClientCredentialsTTL(ctx, token, client) {
            // Determine the TTL for Client Credentials
            return token.resourceServer ? token.resourceServer.accessTokenTTL || 10 * 60 : 10 * 60; // Default to 10 minutes
        },
        DeviceCode: 600, // 10 minutes in seconds
        Grant: 1209600, // 14 days in seconds
        IdToken: 3600, // 1 hour in seconds
        Interaction: 3600, // 1 hour in seconds
        RefreshToken: function RefreshTokenTTL(ctx, token, client) {
            // Determine the TTL for Refresh Tokens based on conditions
            if (
                ctx &&
                ctx.oidc.entities.RotatedRefreshToken &&
                client.applicationType === "web" &&
                client.tokenEndpointAuthMethod === "none" &&
                !token.isSenderConstrained()
            ) {
                // Non-Sender Constrained SPA RefreshTokens do not have infinite expiration through rotation
                return ctx.oidc.entities.RotatedRefreshToken.remainingTTL; // Return the remaining TTL for the rotated refresh token
            }
            return 14 * 24 * 60 * 60; // Default to 14 days in seconds
        },
        Session: 1209600, // 14 days in seconds
      },
};
  
