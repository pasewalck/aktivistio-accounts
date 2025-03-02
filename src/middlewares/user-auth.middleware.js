import { hasPermission, Permission, Role } from "../models/roles.js";
import provider from "../oidc/provider.js";
import accountService from "../services/account.service.js";

/**
 * @description middleware for 
 * @param {import("express").Request} [req]
 * @param {import("express").Response} [res]
 * @return {provider.Session}
 */
async function getSession (req,res) {    
  return await provider.Session.get(provider.app.createContext(req,res))
}

/**
 * @description middleware for 
 * @param {import("express").Request} [req]
 * @param {import("express").Response} [res]
 * @param {import("express").NextFunction} [next]
 */
export async function userAuthMiddleware (req,res, next) {
        
  const session = await getSession(req,res)
  const signedIn = !!session.accountId
    
  if(!signedIn) {
    res.redirect('/login');
  }
  else {
    const account = accountService.find.withId(session.accountId);
    req.account = account
    res.locals.account = account
    res.locals.Role = Role;
    res.locals.Permission = Permission;
    res.locals.hasPermission = hasPermission
    next();
  }

}
/**
 * @description middleware for 
 * @param {import("express").Request} [req]
 * @param {import("express").Response} [res]
 * @param {import("express").NextFunction} [next]
 */
export async function userAuthMiddlewareReverse (req,res, next) {
      
  const session = await getSession(req,res)
  const signedIn = !!session.accountId
    
  if(signedIn) {
    res.redirect('/');
  }
  else {
    next();
  }

}
