import secretDriver from "../drivers/secret.driver.js";
/**
 * @description Get entries from secret storage
 * @param {string} name - The name of the secret
 * @param {Function} generator - A function to generate a new secret (can be async or sync)
 * @param {{lifeTime: Number, graceTime: Number}} [rotation] - Optional rotation settings
 * @returns {Promise<Array<string|JSON>>} - An array of secret values
 */
async function getEntries(name, generator, rotation = false) {
    // Fetch results from the database
    const results = secretDriver.getEntries(name);
    
    // If no results, generate a new secret and return it
    if (!results || results.length === 0) {
        var newEntry = await generator()
        addEntry(name, newEntry)
        return [newEntry];
    }

    // Parse the results into an array
    let array = results.map(result => JSON.parse(result.value));

    // If rotation is enabled, check the latest created timestamp
    if (rotation) {
        const dayMultiplier = 60 * 60 * 24;
        const now = Date.now() / 1000;
        const latestCreated = results[0].created; // Get the latest created timestamp from the results

        // Check if the latest entry is older than the lifetime
        if (latestCreated < now - rotation.lifeTime * dayMultiplier) {
            var newEntry = await generator()
            addEntry(name, newEntry)
            array.unshift(newEntry); // Add new entry to the front of the array
        } 
        // Check if the latest entry is older than the grace time
        else if (latestCreated < now - rotation.lifeTime * dayMultiplier - rotation.graceTime * dayMultiplier) {
            secretDriver.cleanEntries(name,Date.now() / 1000 - rotation.lifeTime * dayMultiplier);
        }
    }
    
    return array;
}
/**
 * @description Add entry to secret storage
 * @param {string} [name]
 * @param {Function} [name]
 * @returns {JSON|String}
 */
function addEntry (name,value) {
    secretDriver.addEntry(name,JSON.stringify(value));
}
/**
 * @description Get entry from secret storage
 * @param {string} [name]
 * @param {Function} [name]
 * @param {{lifeTime,graceTime}} [rotation]
 * @returns {JSON|String}
 */
async function getEntry (name,generator,rotation=false) {
    return await getEntries(name,generator,rotation)[0]
}

export default {
    getEntry,getEntries
}