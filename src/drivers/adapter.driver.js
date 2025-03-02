import dbDriver from "./db.driver.js";

// Initialize tables for the storage
dbDriver.db.exec(`
    create table IF NOT EXISTS adapter_values (
        id text PRIMARY KEY,
        value text NOT NULL,
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
    return dbDriver.db.prepare('SELECT value FROM adapter_values WHERE id = ? AND expire >= ?').get(id,Math.floor(Date.now() / 1000));
}
/**
 * @description set entry from storage
 * @param {string} [id]
 * @param {string} [value]
 * @param {Number} [expire=null]
 */
function insert (id,value,expire=null) {
    dbDriver.db.prepare('INSERT INTO adapter_values (id,value, expire) VALUES (?, ?,?)').run(id,value,expire);
}
/**
 * @description set entry from storage
 * @param {string} [id]
 * @param {string} [value]
 */
function setValue (id,value) {
    dbDriver.db.prepare('UPDATE adapter_values SET value = ? WHERE id = ?').run(value,id);
}

/**
 * @description set entry from storage
 * @param {string} [id]
 * @param {Number} [expire]
 */
function setExpire (id,expire) {
    dbDriver.db.prepare('UPDATE adapter_values SET expire = ? WHERE id = ?').run(expire,id);
}

export default {
    remove,get,setExpire,setValue,insert
}