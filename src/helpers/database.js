import Database from 'better-sqlite3-multiple-ciphers';
import fs from 'fs';
import logger from './logger.js';
import env from './env.js';

/**
 * @typedef {import("../models/migration-version.js")} MigrationVersion
 */

/**
 * @description Initializes a database for a given name using a specified encryption key. This function checks if the database file already exists. If it does not, a new database is created with the provided configuration settings.
 * @param {string} name - The name of the database (used to create the file path).
 * @param {string} databaseKey - The encryption key to secure the database.
 * @returns {{db: Database, isDbInit: boolean}} - An object containing the database instance and a flag indicating if the database was newly initialized.
 */
export function initDatabase(name, databaseKey) {
	// Define database path
	const filePath = `./data/${name}.db`;
	var isDbInit;

	if (!env.DEBUG_DATABASE) {
		// Check if base dir exists
		if (!fs.existsSync('./data/')) fs.mkdirSync('./data');
		// Check if the database file already exists
		isDbInit = !fs.existsSync(filePath);
	} else {
		//Always set as database init if is in memory database
		isDbInit = true;
	}

	// Log the initialization of the database
	logger.info(`Initializing ${name} database`);

	// Create a new Database instance
	const db = env.DEBUG_DATABASE ? new Database(':memory:') : new Database(filePath);

	// Log the configuration of the database
	logger.debug(`Setting configuration for ${name} database`);

	/* Set the database encryption key. Warn if no key exists */
	if (databaseKey) db.pragma(`key='${databaseKey}'`);
	else logger.info(`No encryption key secified for ${name} database!`);

	/* Enable secure delete for the database */
	db.pragma(`secure_delete = ON`);

	/* Set journal mode to DELETE to ensure changes are written without history (default mode) */
	db.pragma(`journal_mode = DELETE`);

	/* Enable foreign keys to be used */
	db.pragma(`foreign_keys = ON`);

	// Return the database instance and whether it was newly initialized
	return { db, isDbInit: isDbInit };
}

/**
 * Executes database migrations in order, tracking completion in a table.
 * @param {Database} db - The database instance to execute migrations against
 * @param {MigrationVersion[]} migrations - Array of MigrationVersion instances to apply, in order
 */
export function doMigrations(db, migrations) {
	// Following could be used to auto load migration versions
	// const migrations = files.map(f => import('./src/migrations/' + folder + '/' + f))

	db.exec(`
		create table IF NOT EXISTS migrations (
        	id INTEGER PRIMARY KEY AUTOINCREMENT,
			version INTEGER UNIQUE,
			idx INTEGER,
			date INTEGER
		);
	`);

	// Only migrations with versions higher than the last applied migration will be executed.
	const currentState = db.prepare('select version,idx FROM migrations ORDER BY version,idx').get();

	migrations.forEach((migrationVersion) => {
		if (currentState == undefined || migrationVersion.version > currentState.version)
			for (let i = 0; i < migrationVersion.migrations.length; i++) {
				const migration = migrationVersion.migrations[i];
				if (currentState == undefined || currentState.idx == undefined || i > currentState.idx) {
					migration.up(db);
					db.prepare(
						`
						INSERT INTO migrations (version,idx, date)
						VALUES (?,?, strftime('%s','now'))
					`
					).run(migrationVersion.version, i);
				}
			}
	});

	// Todo: Implement baseline generation
	// const schema = db.prepare("SELECT sql FROM sqlite_master WHERE type='table'").all();
}
