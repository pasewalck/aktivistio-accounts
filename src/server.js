import app from './app.js';
import env from './helpers/env.js';
import logger from './helpers/logger.js';
import monitorService from './services/monitor.service.js';

// Start the server and listen on the specified port
logger.debug(`Starting and trying to listen on PORT ${env.PORT}`);
const server = app.listen(env.PORT, function () {
	logger.info(`Started express on PORT ${env.PORT}`);
	monitorService.setListening(true);
});

server.on('close', () => {
	logger.info(`Stopped express.`);
	monitorService.setListening(false);
});

if (env.MONITOR.MONITOR_LAG) monitorService.startLagMonitor();

if (env.MONITOR.LOG_REGULARLY) monitorService.scheduleLogStatus();
