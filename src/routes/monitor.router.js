import { userAuthMiddleware } from '../middlewares/user-auth.middleware.js';
import monitorController from '../controllers/monitor.controller.js';
import logger from '../helpers/logger.js';

/**
 * @description Binds controller actions to routes for the monitoring API.
 * @param {import("express").Express} app - The Express application instance.
 */
export default (app) => {
	logger.debug('Initializing monitor router');

	app.get('/api/monitor', userAuthMiddleware, monitorController.status);
};
