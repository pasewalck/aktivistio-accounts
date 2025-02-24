import oidcController from '../controllers/oidc.controller.js';
import sharedController from '../controllers/shared.controller.js';
import logger from '../logger.js';

import {setNoCache} from '../middlewares/set-no-cache.middleware.js'
import sharedRenderer from '../renderers/shared.renderer.js';
import login2faValidations from '../validation/validators/logged-out/login-2fa.validations.js';
import loginValidations from '../validation/validators/logged-out/login.validations.js';

/**
 * @description bind controllers to routes for oidc
 * @param {import("express").Express} [app]
 */
export default (app) => {

  logger.debug("Initializing oidc router")

  app.get('/interaction/:uid/abort', setNoCache, oidcController.abort);
  app.get('/interaction/logout', setNoCache, oidcController.logout);
  app.get('/interaction/:uid', setNoCache, oidcController.interaction);

  app.post('/interaction/:uid/login', setNoCache,loginValidations, sharedController.loginPost);
  app.post('/interaction/:uid/login/2fa', setNoCache,login2faValidations, sharedController.loginSecondFactorPost);
  
  app.post('/interaction/:uid/confirm', setNoCache, oidcController.confirmPost);
  
};