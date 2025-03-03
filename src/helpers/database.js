import Database from 'better-sqlite3-multiple-ciphers';
import fs from 'fs';
import logger from './logger.js';

/**
 * @description Initializes a database for a given name using a specified encryption key. This function checks if the database file already exists. If it does not, a new database is created with the provided configuration settings.
 * @param {string} name - The name of the database (used to create the file path).
 * @param {string} databaseKey - The encryption key to secure the database.
 * @returns {{db: Database, isDbInit: boolean}} - An object containing the database instance and a flag indicating if the database was newly initialized.
 */
export function initDatabase(name, databaseKey) {
    // Define database path
    const filePath = `./data/${name}.db`;
    // Check if base dir exists
    if(!fs.existsSync('./data/'))
        fs.mkdirSync('./data')
    // Check if the database file already exists
    const dbFileExists = fs.existsSync(filePath);
    
    // Log the initialization of the database
    logger.info(`Initializing ${name} database`);
    
    // Create a new Database instance
    const db = new Database(filePath);
    
    // Log the configuration of the database
    logger.debug(`Setting configuration for ${name} database`);
    
    /* Set the database encryption key. Warn if no key exists */
    if(databaseKey)
        db.pragma(`key='${databaseKey}'`);
    else
        logger.error(`No encryption key secified for ${name} database!`)
    
    /* Enable secure delete for the database */
    db.pragma(`secure_delete = ON`);
    
    /* Set journal mode to DELETE to ensure changes are written without history (default mode) */
    db.pragma(`journal_mode = DELETE`);
    
    /* Enable foreign keys to be used */
    db.pragma(`foreign_keys = ON`);
    
    // Return the database instance and whether it was newly initialized
    return { db, isDbInit: !dbFileExists };
}
