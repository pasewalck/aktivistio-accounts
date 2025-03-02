import dbDriver from "./db.driver.js";

// Initialize tables for the storage
dbDriver.db.exec(`
    create table IF NOT EXISTS secrets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name text not null,
        value text not null,
        created INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    );
`)

/**
 * @description Get entry from secret storage
 * @param {String} name - The name of the secret
 * @returns {Array<{}>} - An array of secret values
 */
function getEntries(name) {
    return dbDriver.db.prepare('SELECT value, created FROM secrets WHERE name = ? ORDER BY created DESC').all(name);
}

/**
 * @description Get entry from secret storage
 * @param {String} name - The name of the secret
 * @param {Integer} createdBefore - The time before which to delete entries
 * @returns {Array<{}>} - An array of secret values
 */
function cleanEntries(name,createdBefore) {
    dbDriver.db.prepare(`DELETE FROM secrets WHERE created < ? AND name = ?`).run(createdBefore,name);
}

/**
 * @description get entry
 * @param {String} [name]
 * @param {String} [value]
 * @returns {JSON|String}
 */
function addEntry (name,value) {
    dbDriver.db.prepare('INSERT INTO secrets (name,value) VALUES (?,?)').run(name,value);
}

export default {
    getEntries,cleanEntries,addEntry
}