import dashboardAuthController from '../controllers/logged-out.dashboard.controller.js';
import logger from '../helpers/logger.js';

import {setNoCache} from '../middlewares/set-no-cache.middleware.js'
import {userAuthMiddlewareReverse} from '../middlewares/user-auth.middleware.js';

import login2faValidations from '../validation/validators/logged-out/login-2fa.validations.js';
import loginValidations from '../validation/validators/logged-out/login.validations.js';
import requestInviteValidations from '../validation/validators/logged-out/request.invite.validations.js';
import sharedController from '../controllers/shared.controller.js';
import registerValidations from '../validation/validators/logged-out/register.validations.js';
import registerConsentValidations from '../validation/validators/logged-out/register.consent.validations.js';
import recoveryConfirmStepValidations from '../validation/validators/logged-out/recovery.confirm-step.validations.js';
import recoveryRequestStepValidations from '../validation/validators/logged-out/recovery.request.validations.js';
import recoveryResetStepValidations from '../validation/validators/logged-out/recovery.reset-step.validations.js';

/**
 * @description Binds controllers to routes for the primary app.
 * @param {import("express").Express} app - The Express application instance.
 */
export default (app) => {

    logger.debug("Initializing logged-out router");

    // Common middlewares for all routes
    const middlewares = [setNoCache, userAuthMiddlewareReverse];

    // Invite request routes
    app.get('/invite-request', middlewares, dashboardAuthController.inviteRequest);
    app.post('/invite-request', middlewares, requestInviteValidations, dashboardAuthController.inviteRequestPost);

    // Account recovery routes
    app.get('/account-recovery', middlewares, dashboardAuthController.recovery);
    app.post('/account-recovery/request', middlewares, recoveryRequestStepValidations, dashboardAuthController.recoveryRequestPost);
    app.post('/account-recovery/confirm', middlewares, recoveryConfirmStepValidations, dashboardAuthController.recoveryConfirmPost);
    app.post('/account-recovery/reset', middlewares, recoveryResetStepValidations, dashboardAuthController.recoveryResetPost);

    // Login routes
    app.get('/login', middlewares, dashboardAuthController.login);
    app.post('/login', middlewares, loginValidations, sharedController.loginPost);
    app.post('/login/2fa', middlewares, login2faValidations, sharedController.loginSecondFactorPost);

    // Registration routes
    app.get('/register', middlewares, dashboardAuthController.register);
    app.get('/register/:invite', middlewares, dashboardAuthController.register);
    app.post('/register/', middlewares, registerValidations, dashboardAuthController.registerPost);
    app.post('/register/consent/', middlewares, registerConsentValidations, dashboardAuthController.registerConsentPost);

}