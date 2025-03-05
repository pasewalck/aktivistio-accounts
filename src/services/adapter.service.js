import adapterDriver from "../drivers/adapter.driver.js";
/**
 * @description Remove an entry from storage by its ID and model.
 * @param {String} model - The model associated with the entry.
 * @param {String} id - The ID of the entry to remove.
 */
function removeEntry(model, id) {
    adapterDriver.removeEntry(model, id); // Call the adapter driver to remove the entry
}

/**
 * @description Get an entry from storage by its ID and model.
 * @param {string} model - The model associated with the entry. 
 * @param {String} id - The ID of the entry to retrieve.
 * @returns {Object|undefined} - The parsed entry value as an object, or undefined if not found.
 */
function getEntry(model, id) {
    let result = adapterDriver.getEntryValue(model, id); // Retrieve the entry value from the adapter
    return result ? JSON.parse(result) : undefined; // Parse and return the result, or undefined if not found
}

/**
 * @description Get all values/entries associated with a model
 * @param {string} model - The model to lookup.
 * @returns {Array<Object>} - The parsed entry value as an object, or undefined if not found.
 */
function getEntries(model) {
    let result = adapterDriver.getEntriesValues(model); // Retrieve the entries values

    if(result && result.length > 0)
    {
        // Parse and return the results
        var array = [result.length]
        for (let i = 0; i < array.length; i++) 
            array[i] = JSON.parse(result[i])
            
        return array
    }
    else
        return []; 
}

/**
 * @description Set or update an entry in storage.
 * @param {string} model - The model associated with the entry.
 * @param {String} id - The ID of the entry.
 * @param {Object} value - The value to store.
 * @param {Number|null} expire - Optional expiration time (in seconds from now).
 */
function setEntry(model, id, value, expire = null) {
    console.log(model, id, value)
    let encodedValue = JSON.stringify(value); // Convert the value to a JSON string
    expire = expire ? expire + Math.floor(Date.now() / 1000) : null; // Calculate the expiration timestamp

    // Check if the entry already exists
    if (!getEntry(model, id)) {
        adapterDriver.insertEntry(model, id, encodedValue, expire); // Insert a new entry if it doesn't exist
    } else {
        // Update the existing entry
        if (expire !== null) {
            adapterDriver.setEntryExpire(model, id, expire); // Update the expiration time if provided
        }
        adapterDriver.setEntryValue(model, id, encodedValue); // Update the entry value
    }
}

/**
 * @description Set a lookup value for an entry in storage.
 * @param {String} model - The model associated with the entry.
 * @param {String} id - The ID of the entry.
 * @param {String} name - The name of the lookup value.
 * @param {String} lookupValue - The value of the lookup.
 */
function setLookupForEntry(model, id, name, lookupValue) {
    // Check if the lookup value already exists
    if (adapterDriver.getEntryIdByLookup(model, name, lookupValue)) {
        adapterDriver.updateLookupValueForEntry(model, id, name, lookupValue); // Update the existing lookup value
    } else {
        adapterDriver.addLookupValueForEntry(model, id, name, lookupValue); // Add a new lookup value
    }
}

/**
 * @description Get an entry from storage using a lookup value.
 * @param {String} model - The model associated with the entry.
 * @param {String} name - The name of the lookup value.
 * @param {String} lookupValue - The value of the lookup.
 * @returns {Object|undefined} - The entry value as an object, or undefined if not found.
 */
function getEntryByLookup(model, name, lookupValue) {
    let id = adapterDriver.getEntryIdByLookup(model, name, lookupValue); // Retrieve the entry ID using the lookup
    if (id) {
        return getEntry(model, id); // Get the entry using the retrieved ID
    } else {
        return undefined; // Return undefined if no entry is found
    }
}

/**
 * @description Get an entry from storage using a lookup value.
 * @param {String} model - The model associated with the entry.
 * @param {String} name - The name of the lookup value.
 * @param {String} lookupValue - The value of the lookup.
 * @returns {Object|undefined} - The entry value as an object, or undefined if not found.
 */
function removeEntryByLookup(model, name, lookupValue) {
    let ids = adapterDriver.getEntriesIdsByLookup(model, name, lookupValue); // Retrieve the entries IDs using the lookup
    // Remove all entries for ids
    ids.forEach((id) => adapterDriver.removeEntry(model,id)); // Remove Entry
}

export default {
    removeEntry,
    setEntry,
    getEntry,
    getEntries,
    setLookupForEntry,
    getEntryByLookup,
    removeEntryByLookup
};
