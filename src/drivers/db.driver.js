import Database from 'better-sqlite3-multiple-ciphers';
import fs from 'fs';
import config from '../config.js';
import logger from '../logger.js';

/**
 * @description indicate if database is just created
 * @type {Boolean}
 */
const isDbInit = !fs.existsSync("data.db")
/**
 * @description database object
 * @type {Database}
 */
const db = new Database("data.db");

logger.debug(`Setting database configuation`)
/* Set database encryption key */
db.pragma(`key='${config.databaseKey}'`);
/* Turn on secure delete for database */
db.pragma(`secure_delete = ON`);
/* Make sure changes are writen with not history on them (also is the default mode) */
db.pragma(`journal_mode = DELETE`);
/* Activate foreign keys */
db.pragma(`foreign_keys = ON`);

export default {db,isDbInit}
