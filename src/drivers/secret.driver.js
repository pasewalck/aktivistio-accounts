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
 * @param {string} name - The name of the secret
 * @param {Function} generator - A function to generate a new secret (can be async or sync)
 * @param {{lifeTime: number, graceTime: number}} [rotation] - Optional rotation settings
 * @returns {Promise<Array<string|JSON>>} - An array of secret values
 */
async function getSecretEntries(name, generator, rotation = false) {
    // Fetch results from the database
    const results = dbDriver.db.prepare('SELECT value, created FROM secrets WHERE name = ? ORDER BY created DESC').all(name);
    
    // If no results, generate a new secret and return it
    if (!results || results.length === 0) {
        return [addEntryForSecret(name, await generator())];
    }

    // Parse the results into an array
    let array = results.map(result => JSON.parse(result.value)); // Assuming 'value' is the field to parse

    // If rotation is enabled, check the latest created timestamp
    if (rotation) {
        const dayMultiplier = 60 * 60 * 24;
        const now = Date.now() / 1000;
        const latestCreated = results[0].created; // Get the latest created timestamp from the results

        // Check if the latest entry is older than the lifetime
        if (latestCreated < now - rotation.lifeTime * dayMultiplier) {
            array.unshift(addEntryForSecret(name, await generator())); // Add new entry to the front of the array
        } 
        // Check if the latest entry is older than the grace time
        else if (latestCreated < now - rotation.lifeTime * dayMultiplier - rotation.graceTime * dayMultiplier) {
            dbDriver.db.prepare(`DELETE FROM secrets WHERE created < ? AND name = ?`).run(Date.now() / 1000 - rotation.lifeTime * dayMultiplier, name);
        }
    }
    
    return array;
}

/**
 * @description get entry
 * @param {string} [name]
 * @param {Function} [name]
 * @returns {JSON|String}
 */
function addEntryForSecret (name,value) {
    dbDriver.db.prepare('INSERT INTO secrets (name,value) VALUES (?,?)').run(name,JSON.stringify(value));
}

/**
 * @description get entry from secret storage
 * @param {string} [name]
 * @param {Function} [name]
 * @param {{lifeTime,graceTime}} [rotation]
 * @returns {JSON|String}
 */
async function getSecretEntry (name,generator,rotation=false) {
    return await getSecretEntries(name,generator,rotation)[0]
}









export default {
    getSecretEntries,getSecretEntry
}