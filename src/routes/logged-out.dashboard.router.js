import dashboardAuthController from '../controllers/logged-out.dashboard.controller.js';
import logger from '../logger.js';

import {setNoCache} from '../middlewares/set-no-cache.middleware.js'
import {userAuthMiddlewareReverse} from '../middlewares/user-auth.middleware.js';
import login2faValidations from '../validation/validators/logged-out/login-2fa.validations.js';
import loginValidations from '../validation/validators/logged-out/login.validations.js';
import registerValidations from '../validation/validators/logged-out/register.validations.js';
import requestRecoveryValidations from '../validation/validators/logged-out/request.recovery.validations.js';
import requestInviteValidations from '../validation/validators/logged-out/request.invite.validations.js';
import sharedController from '../controllers/shared.controller.js';
import resetStepRecoveryValidations from '../validation/validators/logged-out/reset-step.recovery.validations.js';

/**
 * @description bind controllers to routes for primary app
 * @param {import("express").Express} [app]
 */
export default (app) => {

    logger.debug("Initializing logged-out router")

    const middlewares = [setNoCache,userAuthMiddlewareReverse]

    app.get('/invite-request',middlewares,dashboardAuthController.inviteRequest);
    app.post('/invite-request',middlewares,requestInviteValidations,dashboardAuthController.inviteRequestPost);

    app.get('/account-recovery',middlewares,dashboardAuthController.recovery);
    app.post('/account-recovery/',middlewares,requestRecoveryValidations,dashboardAuthController.recoveryPost);
    app.post('/account-recovery/reset',middlewares,resetStepRecoveryValidations,dashboardAuthController.recoveryResetPost);

    app.get('/login',middlewares,dashboardAuthController.login);
    app.post('/login',middlewares,loginValidations,sharedController.loginPost);
    app.post('/login/2fa',middlewares,login2faValidations,sharedController.loginSecondFactorPost);

    app.get('/register',middlewares,dashboardAuthController.register);
    app.get('/register/:invite',middlewares,dashboardAuthController.register);
    app.post('/register',middlewares,registerValidations,dashboardAuthController.registerPost);
}