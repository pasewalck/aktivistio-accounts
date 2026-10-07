import fs from 'fs';
import { CronJob } from 'cron';
import adapterDriver from '../drivers/adapter.driver.js';
import dataDriver from '../drivers/data.driver.js';
import secretDriver from '../drivers/secret.driver.js';
import { backupDatabase } from '../helpers/database.js';
import env from '../helpers/env.js';
import logger from '../helpers/logger.js';

async function backup() {
	fs.mkdirSync('./backups', { recursive: true });
	try {
		await backupDatabase(secretDriver.databaseName, secretDriver.db);
		await backupDatabase(dataDriver.databaseName, dataDriver.db);
		await backupDatabase(adapterDriver.databaseName, adapterDriver.db);
	} catch (error) {
		logger.error(error);
	}
}

function clearBackups() {
	if (fs.existsSync('./backups'))
		fs.readdirSync('./backups').forEach((file) => {
			const matches = Array.from(file.matchAll('^(?<name>[a-z]+)-backup-(?<date>\\d+)\\.db$'))[0];
			if (matches && matches.groups && matches.groups.date) {
				const createdDate = parseInt(matches.groups.date);
				if (
					createdDate &&
					Date.now() - createdDate >= env.DATABASE_BACKUPS.RETENTION_DAYS * 1000 * 60 * 60 * 24
				) {
					if (!env.DEBUG_DATABASE) fs.unlinkSync(`./backups/${file}`);
				}
			}
		});
}

function init() {
	if (!env.DATABASE_BACKUPS.DO) return;
	if (process.env.NODE_ENV === 'test') return;

	CronJob.from({
		cronTime: env.DATABASE_BACKUPS.CRON,
		onTick: () => {
			clearBackups();
			backup();
		},
		start: true,
		errorHandler: (error) => logger.error(error),
	});
}

export default {
	init,
};
