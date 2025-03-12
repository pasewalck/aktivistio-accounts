import { initDatabase } from "../helpers/database.js";
import env from "../helpers/env.js";

// Initialize the database connection for the Brute storage
const { db } = initDatabase("brute", env.DATABASE_KEYS.BRUTE);

const lifetime = 60 * 60 * 24; // 24 hours

// Create tables for storing entries and their lookups if they do not already exist
db.exec(`
    CREATE TABLE IF NOT EXISTS fails (
        ip_hash BLOB NOT NULL,
        action TEXT NOT NULL,
        key TEXT DEFAULT NULL,
        last_update INTEGER NOT NULL,
        count INTEGER NOT NULL,
        PRIMARY KEY (ip_hash,action,key)

    );
`);

export default {
    /**
     * @description Retrieves failed login attempts by IP hash.
     * @param {Buffer} ipHash - The hashed IP address.
     * @returns {Array<{ipHash: string, action: string, key: string, time: number}>} - An array of objects containing the IP hash, action, key, and time of the failed attempts.
     */
    countByIpHash: (ipHash) => {
        const currentTime = Math.floor(Date.now() / 1000); // Get the current time in seconds since epoch
        return db.prepare('SELECT SUM(count) FROM fails WHERE ip_hash = ? AND last_update >= ?')
            .pluck()
            .all(ipHash, currentTime - lifetime);
    },

    /**
     * @description Retrieves failed login attempts based on IP hash, and action.
     * @param {string} ipHash - The hashed IP address.
     * @param {string} action - The action that was attempted (e.g., "login").
     * @returns {Array<{ipHash: string, action: string, key: string, time: number}>} - An array of objects containing the IP hash, action, key, and time of the failed attempts.
     */
    countActionAndKeySpecific: (action,key) => {
        const currentTime = Math.floor(Date.now() / 1000); // Get the current time in seconds since epoch
        return db.prepare('SELECT SUM(count) FROM fails WHERE action = ? AND key = ? AND last_update >= ?')
            .pluck()
            .all(action, key, currentTime - lifetime);
    },

    /**
     * @description Retrieves failed login attempts based on IP hash, action, and key.
     * @param {string} ipHash - The hashed IP address.
     * @param {string} action - The action that was attempted (e.g., "login").
     * @param {string} key - A unique key associated with the action (e.g., username).
     * @returns {Array<{ipHash: string, action: string, key: string, time: number}>} - An array of objects containing the IP hash, action, key, and time of the failed attempts.
     */
    get: (ipHash, action, key) => {
        const currentTime = Math.floor(Date.now() / 1000); // Get the current time in seconds since epoch
        return db.prepare('SELECT last_update as lastUpdate, count FROM fails WHERE ip_hash = ? AND action = ? AND key = ? AND last_update >= ?')
            .get(ipHash, action, key, currentTime - lifetime);
    },

    /**
     * @description Inserts a failed login attempt into the database.
     * @param {string} ipHash - The hashed IP address.
     * @param {string} action - The action that was attempted (e.g., "login").
     * @param {string} key - A unique key associated with the action (e.g., username).
     */
    insert: (ipHash, action, key) => {
        const currentTime = Math.floor(Date.now() / 1000); // Get the current time in seconds since epoch
        db.prepare('INSERT INTO fails (ip_hash, action, key, last_update, count) VALUES (?, ?, ?, ?, ?)').run(ipHash, action, key, currentTime, 1);
    },

    /**
     * @description Inserts a failed login attempt into the database.
     * @param {string} ipHash - The hashed IP address.
     * @param {string} action - The action that was attempted (e.g., "login").
     * @param {string} key - A unique key associated with the action (e.g., username).
     */
    updateCount: (ipHash, action, key,newCount) => {
        const currentTime = Math.floor(Date.now() / 1000); // Get the current time in seconds since epoch
        db.prepare('UPDATE fails SET count = ?, last_update = ? WHERE ip_hash = ? AND action = ? AND key = ?').run(newCount,currentTime,ipHash, action, key);

    }
}

// Cleans up expired entries from the database.
function cleanup() {
    const currentTime = Math.floor(Date.now() / 1000); // Get the current time in seconds since epoch
    db.prepare('DELETE FROM fails WHERE last_update < ?').run(currentTime - lifetime); // Delete expired entries
}

// Schedule cleanup of expired events every hour
setInterval(cleanup, 3600000); // 3600000 milliseconds = 1 hour
