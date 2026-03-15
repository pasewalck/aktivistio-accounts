import app from './app.js';
import env from './helpers/env.js';
import logger from './helpers/logger.js';

// Start the server and listen on the specified port
logger.debug(`Starting and trying to listen on PORT ${env.PORT}`);
app.listen(env.PORT, function () {
	logger.info(`Started on PORT ${env.PORT}`);
});
