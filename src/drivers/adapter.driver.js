import dbDriver from "./db.driver.js";

// Initialize tables for the storage
dbDriver.db.exec(`
    create table IF NOT EXISTS adapter_values (
        id text PRIMARY KEY,
        value text not null,
        expire INTEGER
    );
`)

/**
 * @description remove entry from storage
 * @param {string} [id]
 */
function remove (id) {
    dbDriver.db.prepare('DELETE FROM adapter_values WHERE id = ?').run(id);
}
/**
 * @description get entry from storage
 * @param {string} [id]
 * @returns {JSON}
 */
function get (id) {
    let result = dbDriver.db.prepare('SELECT value FROM adapter_values WHERE id = ?').get(id);
    if(result == undefined)
        return undefined;
    else if(result.expire < Math.floor(Date.now() / 1000))
        return undefined;
    else
        return JSON.parse(result.value);
}
/**
 * @description set entry from storage
 * @param {string} [id]
 * @param {string} [value]
 * @param {Number} [expire=null]
 */
function set (id,value,expire=null) {
    let encodedValue = JSON.stringify(value)
    expire = expire ? expire + Math.floor(Date.now() / 1000) : null;
    if(!get(id))
        dbDriver.db.prepare('INSERT INTO adapter_values (id,value, expire) VALUES (?, ?,?)').run(id,encodedValue,expire);
    else if (expire = null)
        dbDriver.db.prepare('UPDATE adapter_values SET value = ? WHERE id = ?').run(encodedValue,id);
    else
        dbDriver.db.prepare('UPDATE adapter_values SET value = ?,expire = ? WHERE id = ?').run(encodedValue,expire,id);
}

export default {
    remove,get,set
}