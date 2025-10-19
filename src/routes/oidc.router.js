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
 * along with "Aktivistio Accounts". If not, see <https://www.gnu.org/licenses/>.
 *
 * Copyright (C) 2025 Jana
 */
import { setNoCache } from '../middlewares/set-no-cache.middleware.js';

import oidcController from '../controllers/oidc.controller.js';
import sharedController from '../controllers/shared.controller.js';
import logger from '../helpers/logger.js';
import login2faValidations from '../validation/validators/logged-out/login-2fa.validations.js';
import loginValidations from '../validation/validators/logged-out/login.validations.js';
import { loginRateLimiterMiddleware, twoFactorLoginRateLimiterMiddleware } from '../middlewares/rate-limiter.middlewares.js';

/**
 * @description Binds controllers to routes for OIDC (OpenID Connect).
 * @param {import("express").Express} app - The Express application instance.
 */
export default (app) => {
  logger.debug("Initializing OIDC router");

  // Route to abort the interaction
  app.get('/interaction/:uid/abort', setNoCache, oidcController.abort);

  // Route to handle the interaction
  app.get('/interaction/:uid', setNoCache, oidcController.interaction);

  // Route to handle login with validations
  app.post('/interaction/:uid/login', setNoCache, loginRateLimiterMiddleware, loginValidations, sharedController.loginPost);

  // Route to handle second factor authentication during login
  app.post('/interaction/:uid/login/2fa', setNoCache, twoFactorLoginRateLimiterMiddleware, login2faValidations, sharedController.loginSecondFactorPost);
  
  // Route to confirm the interaction
  app.post('/interaction/:uid/confirm', setNoCache, oidcController.confirmPost);
  
};
