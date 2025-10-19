/* 
 * This file is part of "Aktivistio Accounts".
 *
 * The project "Aktivistio Accounts" implements an account system and 
 * management platform combined with an OAuth 2.0 Authorization Server.
 *
 * "Aktivistio Accounts" is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * "Aktivistio Accounts" is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with "Aktivistio Accounts". If not, see https://www.gnu.org/licenses/.
 *
 * Copyright (C) 2025 Jana
 */
import dashboardAuthController from '../controllers/logged-out.dashboard.controller.js';
import logger from '../helpers/logger.js';

import {setNoCache} from '../middlewares/set-no-cache.middleware.js'
import {userAuthMiddlewareReverse} from '../middlewares/user-auth.middleware.js';
import { loginRateLimiterMiddleware, recoveryRateLimiterMiddleware, registerInviteWelcomeRequestRateLimiterMiddleware, twoFactorLoginRateLimiterMiddleware } from '../middlewares/rate-limiter.middlewares.js';

import login2faValidations from '../validation/validators/logged-out/login-2fa.validations.js';
import loginValidations from '../validation/validators/logged-out/login.validations.js';
import requestInviteValidations from '../validation/validators/logged-out/request.invite.validations.js';
import sharedController from '../controllers/shared.controller.js';
import registerValidations from '../validation/validators/logged-out/register.validations.js';
import setupConsentValidations from '../validation/validators/logged-out/setup.consent.validations.js';
import recoveryRequestStepValidations from '../validation/validators/logged-out/recovery.request.validations.js';
import recoveryResetStepValidations from '../validation/validators/logged-out/recovery.reset-step.validations.js';
import recoveryLinkValidations from '../validation/validators/logged-out/recovery.link.validations.js';
import accountSetupLinkValidations from '../validation/validators/logged-out/account-setup.link.validations.js';
import accountSetupDetailsValidations from '../validation/validators/logged-out/account-setup.details.validations.js';

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
    app.post('/invite-request', middlewares, registerInviteWelcomeRequestRateLimiterMiddleware, requestInviteValidations, dashboardAuthController.inviteRequestPost);

    // Account recovery routes
    app.get('/account-recovery', middlewares, dashboardAuthController.recovery);
    app.post('/account-recovery/request', middlewares, recoveryRateLimiterMiddleware, recoveryRequestStepValidations, dashboardAuthController.recoveryRequestPost);
    app.get('/account-recovery/reset/:actionToken/', middlewares, recoveryLinkValidations, dashboardAuthController.recoveryReset);
    app.post('/account-recovery/reset/:actionToken/', middlewares, recoveryLinkValidations, recoveryResetStepValidations, dashboardAuthController.recoveryResetPost);

    // Account setup routes
    app.get('/welcome/:actionToken/', middlewares, registerInviteWelcomeRequestRateLimiterMiddleware, accountSetupLinkValidations, dashboardAuthController.accountSetup);
    app.post('/welcome/:actionToken/', middlewares, registerInviteWelcomeRequestRateLimiterMiddleware, accountSetupLinkValidations, accountSetupDetailsValidations, dashboardAuthController.accountSetupPost);
    app.post('/welcome/:actionToken/consent/', middlewares, registerInviteWelcomeRequestRateLimiterMiddleware, accountSetupLinkValidations, setupConsentValidations, dashboardAuthController.accountSetupConsentPost);

    // Login routes
    app.get('/login', middlewares, dashboardAuthController.login);
    app.post('/login', middlewares, loginRateLimiterMiddleware, loginValidations, sharedController.loginPost);
    app.post('/login/2fa', middlewares, twoFactorLoginRateLimiterMiddleware, login2faValidations, sharedController.loginSecondFactorPost);

    // Registration routes
    app.get('/register', middlewares, dashboardAuthController.register);
    app.get('/register/:invite', middlewares, dashboardAuthController.register);
    app.post('/register/', middlewares, registerInviteWelcomeRequestRateLimiterMiddleware, registerValidations, dashboardAuthController.registerPost);
    app.post('/register/consent/', middlewares, setupConsentValidations, dashboardAuthController.registerConsentPost);

}
