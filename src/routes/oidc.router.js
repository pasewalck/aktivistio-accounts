import oidcController from '../controllers/oidc.controller.js';
import logger from '../logger.js';

import {setNoCache} from '../middlewares/set-no-cache.middleware.js'

/**
 * @description bind controllers to routes for oidc
 * @param {import("express").Express} [app]
 */
export default (app) => {

  logger.debug("Initializing oidc router")

  app.get('/interaction/:uid/abort', setNoCache, oidcController.abort);
  app.get('/interaction/logout', setNoCache, oidcController.logout);
  app.get('/interaction/:uid', setNoCache, oidcController.interaction);
  app.get('/interaction/:uid/login', setNoCache, oidcController.interaction);
  app.get('/interaction/:uid/register', setNoCache, oidcController.register);

  app.post('/interaction/:uid/register', setNoCache, oidcController.registerPost);
  app.post('/interaction/:uid/login', setNoCache, oidcController.loginPost);
  app.post('/interaction/:uid/confirm', setNoCache, oidcController.confirmPost);
  
};