import { monitorEventLoopDelay } from 'perf_hooks';
import logger from '../helpers/logger.js';

let isListening = false;
const histogram = monitorEventLoopDelay({ resolution: 10 });

/**
 * @description Monitors event loop lag by scheduling a frequent check.
 */
function startLagMonitor() {
	histogram.enable();
}

/**
 * @description Retrieves current memory usage of the process.
 * @returns {Object} Memory usage metrics.
 */
function getMemoryUsage() {
	const used = process.memoryUsage();
	return {
		rss: Math.round((used.rss / 1024 / 1024) * 100) / 100,
		heapTotal: Math.round((used.heapTotal / 1024 / 1024) * 100) / 100,
		heapUsed: Math.round((used.heapUsed / 1024 / 1024) * 100) / 100,
		external: Math.round((used.external / 1024 / 1024) * 100) / 100,
		unit: 'MB',
	};
}

/**
 * @description Sets the server's listening status.
 * @param {boolean} status - Whether the server is listening.
 */
function setListening(status) {
	isListening = status;
}

/**
 * @description Logs the current memory usage, event loop lag, and server status.
 */
async function logStatus() {
	logger.info({
		msg: 'Application Monitoring Status',
		...getStatus(),
	});

	if (histogram.count > 0) histogram.reset();
}

/**
 * @description Returns uptime formatted to include minutes, hours and days.
 */
function formattedUptime() {
	const totalSeconds = Math.floor(process.uptime());

	const days = Math.floor(totalSeconds / 86400);
	const hours = Math.floor((totalSeconds % 86400) / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;

	const parts = [days && `${days}d`, hours && `${hours}h`, minutes && `${minutes}m`, seconds && `${seconds}s`].filter(
		Boolean
	);

	return parts.join(' ') || '0s';
}

/**
 * @description Schedules full status printing frequently.
 */
async function scheduleLogStatus() {
	// Initial log after a short delay
	setTimeout(logStatus, 5000).unref();
	// Set interval to log status every hour
	setInterval(logStatus, 60 * 60 * 1000).unref();
}

/**
 * @description Retrieves current application status including memory, event loop and uptime.
 * @returns {Object} Application status metrics.
 */
function getStatus() {
	return {
		uptime: formattedUptime(),
		uptimeSeconds: Math.floor(process.uptime()),
		express: {
			isListening,
		},
		eventLoop:
			histogram.count > 0
				? {
						min: histogram.min / 1e6,
						max: histogram.max / 1e6,
						mean: histogram.mean / 1e6,
						P99: histogram.percentile(99) / 1e6,
					}
				: {},
		memory: getMemoryUsage(),
	};
}

export default {
	setListening,
	getMemoryUsage,
	getStatus,
	logStatus,
	scheduleLogStatus,
	startLagMonitor,
};
