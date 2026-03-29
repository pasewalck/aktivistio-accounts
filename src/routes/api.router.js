import { userAuthMiddleware } from '../middlewares/user-auth.middleware.js';
import apiController from '../controllers/api.controller.js';
import logger from '../helpers/logger.js';

/**
 * @description Binds controller actions to routes for the monitoring API.
 * @param {import("express").Express} app - The Express application instance.
 */
export default (app) => {
	logger.debug('Initializing api router');

	app.get('/api/monitor', userAuthMiddleware, apiController.applicationMonitorGetStatus);
};
