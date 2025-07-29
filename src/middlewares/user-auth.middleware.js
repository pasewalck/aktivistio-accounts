import { hasPermission, Permission, Role } from "../models/roles.js";

import provider from "../helpers/oidc/provider.js";
import accountService from "../services/account.service.js";

/**
 * @description Retrieves the OIDC session for the given request and response.
 * @param {import("express").Request} req - The request object.
 * @param {import("express").Response} res - The response object.
 * @returns {Promise<provider.Session>} The session object.
 */
async function getOIDCSession(req, res) {    
  return await provider.Session.get(provider.createContext(req, res));
}

/**
 * @description Middleware to authenticate users and set account information in the request.
 * If the user is not signed in, they are redirected to the login page.
 * @param {import("express").Request} req - The request object.
 * @param {import("express").Response} res - The response object.
 * @param {import("express").NextFunction} next - The next middleware function.
 */
export async function userAuthMiddleware(req, res, next) {
  const session = await getOIDCSession(req, res);
  const signedIn = !!session.accountId;

  // Redirect to login if not signed in. Else modify request and response
  if (!signedIn) {
    res.redirect('/login');
  } else {
    const account = await accountService.find.withId(session.accountId);

    // Set account information in the request
    req.account = account; 
    req.loginTs = session.loginTs

    // Set account options in response locals to be used in ejsrendering
    res.locals.account = account;
    res.locals.Role = Role;
    res.locals.Permission = Permission;
    res.locals.hasPermission = hasPermission;

    next();
  }
}

/**
 * @description Middleware to redirect signed-in users away from login or registration pages.
 * @param {import("express").Request} req - The request object.
 * @param {import("express").Response} res - The response object.
 * @param {import("express").NextFunction} next - The next middleware function.
 */
export async function userAuthMiddlewareReverse(req, res, next) {
  const session = await getOIDCSession(req, res);
  const signedIn = !!session.accountId;

  if (signedIn) {
    res.redirect('/');
  } else {
    next();
  }
}
