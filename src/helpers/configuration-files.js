import fs from 'fs';
import logger from './logger.js';

/**
 * @typedef {Object} ConfigurationFile
 * @property {string} path - Path to the configuration file.
 * @property {string} description - Human-readable description used in the warning.
 */

/**
 * @description Logs a warning for every required configuration file that does not exist.
 * @param {ConfigurationFile[]} files - Configuration files to check.
 */
export function warnMissingConfigurationFiles(files) {
	for (const { path, description } of files) {
		if (!fs.existsSync(path)) {
			logger.warn(`Missing configuration file (${description}): "${path}"`);
		}
	}
}
