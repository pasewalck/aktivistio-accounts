import { setNoCache } from '../middlewares/set-no-cache.middleware.js';

import oidcController from '../controllers/oidc.controller.js';
import sharedController from '../controllers/shared.controller.js';
import logger from '../helpers/logger.js';
import login2faValidations from '../validation/validators/logged-out/login-2fa.validations.js';
import loginValidations from '../validation/validators/logged-out/login.validations.js';
import bruteProtectionMiddleware from '../middlewares/brute-protection.middleware.js';

/**
 * @description Binds controllers to routes for OIDC (OpenID Connect).
 * @param {import("express").Express} app - The Express application instance.
 */
export default (app) => {
  logger.debug("Initializing OIDC router");

  // Route to abort the interaction
  app.get('/interaction/:uid/abort', setNoCache, bruteProtectionMiddleware, oidcController.abort);

  // Route to handle the interaction
  app.get('/interaction/:uid', setNoCache, bruteProtectionMiddleware, oidcController.interaction);

  // Route to handle login with validations
  app.post('/interaction/:uid/login', setNoCache, bruteProtectionMiddleware, loginValidations, sharedController.loginPost);

  // Route to handle second factor authentication during login
  app.post('/interaction/:uid/login/2fa', setNoCache, bruteProtectionMiddleware, login2faValidations, sharedController.loginSecondFactorPost);
  
  // Route to confirm the interaction
  app.post('/interaction/:uid/confirm', setNoCache, bruteProtectionMiddleware, oidcController.confirmPost);
  
};
