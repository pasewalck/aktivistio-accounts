import dashboardAuthController from '../controllers/dashboard.auth.controller.js';
import dashboardController from '../controllers/dashboard.controller.js';
import logger from '../logger.js';

import {setNoCache} from '../middlewares/set-no-cache.middleware.js'
import {userAuthMiddleware,userAuthMiddlewareReverse} from '../middlewares/user-auth.middleware.js';

/**
 * @description bind controllers to routes for primary app
 * @param {import("express").Express} [app]
 */
export default (app) => {

    logger.debug("Initializing app router")

    app.get('/',setNoCache,userAuthMiddleware,dashboardController.services);
    app.get('/services',setNoCache,userAuthMiddleware,dashboardController.services);

    app.get('/account',setNoCache,userAuthMiddleware,dashboardController.account);

    app.get('/account/2fa',setNoCache,userAuthMiddleware,dashboardController.account2fa);
    app.get('/account/2fa/add',setNoCache,userAuthMiddleware,dashboardController.accountAdd2fa);
    app.post('/account/2fa/set',setNoCache,userAuthMiddleware,dashboardController.accountChange2faPost);

    app.get('/account/password',setNoCache,userAuthMiddleware,dashboardController.accountChangePassword);
    app.post('/account/password',setNoCache,userAuthMiddleware,dashboardController.accountChangePasswordPost);

    app.get('/account/recovery',setNoCache,userAuthMiddleware,dashboardController.accountRecovery);
    app.get('/account/recovery/set-email',setNoCache,userAuthMiddleware,dashboardController.accountRecoverySetEmail);
    app.get('/account/recovery/set-token',setNoCache,userAuthMiddleware,dashboardController.accountRecoverySetToken);
    app.get('/account/recovery/delete-email',setNoCache,userAuthMiddleware,dashboardController.accountRecoveryDeleteEmail);
    app.get('/account/recovery/delete-token',setNoCache,userAuthMiddleware,dashboardController.accountRecoveryDeleteToken);
    app.post('/account/recovery/set-email',setNoCache,userAuthMiddleware,dashboardController.accountRecoverySetEmailPost);
    app.post('/account/recovery/set-token',setNoCache,userAuthMiddleware,dashboardController.accountRecoverySetTokenPost);
    app.post('/account/recovery/delete-email',setNoCache,userAuthMiddleware,dashboardController.accountRecoveryDeleteEmailPost);
    app.post('/account/recovery/delete-token',setNoCache,userAuthMiddleware,dashboardController.accountRecoveryDeleteTokenPost);

    app.get('/account/delete',setNoCache,userAuthMiddleware,dashboardController.accountDelete);
    app.post('/account/delete',setNoCache,userAuthMiddleware,dashboardController.accountDeletePost);
    
    app.get('/invites',setNoCache,userAuthMiddleware,dashboardController.invites);
    app.post('/invites/generate',setNoCache,userAuthMiddleware,dashboardController.invitesGeneratePost);
    app.get('/invites/share/:invite',setNoCache,userAuthMiddleware,dashboardController.inviteShare);

    
    app.get('/invite-request',setNoCache,userAuthMiddlewareReverse,dashboardAuthController.inviteRequest);
    app.post('/invite-request',setNoCache,userAuthMiddlewareReverse,dashboardAuthController.inviteRequestPost);

    app.get('/account-recovery',setNoCache,userAuthMiddlewareReverse,dashboardAuthController.recovery);
    app.post('/account-recovery',setNoCache,userAuthMiddlewareReverse,dashboardAuthController.recoveryPost);

    app.get('/login',setNoCache,userAuthMiddlewareReverse,dashboardAuthController.login);
    app.post('/login',setNoCache,userAuthMiddlewareReverse,dashboardAuthController.loginPost);

    app.get('/register',setNoCache,userAuthMiddlewareReverse,dashboardAuthController.register);
    app.get('/register/:invite',setNoCache,userAuthMiddlewareReverse,dashboardAuthController.register);
    app.post('/register',setNoCache,userAuthMiddlewareReverse,dashboardAuthController.registerPost);
}