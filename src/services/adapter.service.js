import adapterDriver from "../drivers/adapter.driver.js";

/**
 * @description remove entry from storage
 * @param {String} [id]
 */
function removeEntry (id) {
    adapterDriver.remove(id);
}
/**
 * @description get entry from storage
 * @param {String} [id]
 * @returns {JSON}
 */
function getEntry (id) {
    let result = adapterDriver.get(id)
    return result ? JSON.parse(result.value) : undefined;
}
/**
 * @description set entry from storage
 * @param {String} [id]
 * @param {String} [value]
 * @param {Number} [expire=null]
 */
function setEntry (id,value,expire=null) {
    let encodedValue = JSON.stringify(value)
    expire = expire ? expire + Math.floor(Date.now() / 1000) : null;
    if(!getEntry(id))
        adapterDriver.insert(id,encodedValue,expire);
    else {
        if (expire = null)
            adapterDriver.setValue(id,expire)
        adapterDriver.setValue(id,encodedValue)
    }
}

export default {
    removeEntry,setEntry,getEntry
}