import { initDatabase } from "../helpers/database.js";
import env from "../helpers/env.js";

// Initialize the database connection for the Brute storage
const { db } = initDatabase("brute", env.DATABASE_KEYS.BRUTE);

const lifetime = 60 * 60 * 24; // Entry lifetime set to 24 hours

// Create tables for blocks and failed attempts if they do not exist
db.exec(`
    CREATE TABLE IF NOT EXISTS blocks (
        ip_hash BLOB NOT NULL,
        block_until INTEGER NOT NULL,
        PRIMARY KEY (ip_hash, block_until)
    );

    CREATE TABLE IF NOT EXISTS fails (
        ip_hash BLOB NOT NULL,
        action TEXT NOT NULL,
        key TEXT DEFAULT NULL,
        time INTEGER NOT NULL,
        PRIMARY KEY (ip_hash, action, key, time)
    );
`);

export default {
    /**
     * @description Counts failed attempts by IP hash, excluding a specific action.
     * @param {Buffer} ipHash - The hashed IP address.
     * @param {string|null} [ignoreAction=null] - The action to exclude from the count.
     * @returns {number} - Count of failed attempts.
     */
    failCountByIpHash: (ipHash, ignoreAction = null) => {
        const currentTime = Math.floor(Date.now() / 1000);
        return db.prepare('SELECT COUNT(*) FROM fails WHERE ip_hash = ? AND action != ? AND time >= ?')
            .pluck()
            .get(ipHash, ignoreAction, currentTime - lifetime);
    },

    /**
     * @description Counts failed attempts by IP hash for a specific action and key.
     * @param {Buffer} ipHash - The hashed IP address.
     * @param {string} action - The action attempted.
     * @param {string} key - Unique key associated with the action.
     * @param {number} [since=Math.floor(Date.now() / 1000) - lifetime] - Time threshold for counting.
     * @returns {number} - Count of failed attempts.
     */
    failCount: (ipHash, action, key, since = Math.floor(Date.now() / 1000) - lifetime) => {
        return db.prepare('SELECT COUNT(*) FROM fails WHERE ip_hash = ? AND action = ? AND key = ? AND time >= ?')
            .pluck()
            .get(ipHash, action, key, since);
    },

    /**
     * @description Counts failed attempts by IP hash for a specific action.
     * @param {Buffer} ipHash - The hashed IP address.
     * @param {string} action - The action attempted.
     * @param {number} [since=Math.floor(Date.now() / 1000) - lifetime] - Time threshold for counting.
     * @returns {number} - Count of failed attempts.
     */
    failCountActionSpecific: (ipHash, action, since = Math.floor(Date.now() / 1000) - lifetime) => {
        return db.prepare('SELECT COUNT(*) FROM fails WHERE ip_hash = ? AND action = ? AND time >= ?')
            .pluck()
            .get(ipHash, action, since);
    },

    /**
     * @description Counts failed attempts based on action and key.
     * @param {string} action - The action attempted.
     * @param {string} key - Unique key associated with the action.
     * @returns {number} - Count of failed attempts.
     */
    failCountActionAndKeySpecific: (action, key) => {
        const currentTime = Math.floor(Date.now() / 1000);
        return db.prepare('SELECT COUNT(*) FROM fails WHERE action = ? AND key = ? AND time >= ?')
            .pluck()
            .get(action, key, currentTime - lifetime);
    },

    /**
     * @description Counts failed attempts based on a specific key, excluding a specific IP hash.
     * @param {string} key - Unique key associated with the action.
     * @param {Buffer|null} [ignoreIpHash=null] - The IP hash to exclude from the count.
     * @returns {number} - Count of failed attempts.
     */
    failCountKeySpecific: (key, ignoreIpHash = null) => {
        const currentTime = Math.floor(Date.now() / 1000);
        return db.prepare('SELECT COUNT(*) FROM fails WHERE key = ? AND ip_hash != ? AND time >= ?')
            .pluck()
            .get(key, ignoreIpHash, currentTime - lifetime);
    },

    /**
     * @description Records a failed attempt in the database.
     * @param {Buffer} ipHash - The hashed IP address.
     * @param {string} action - The action attempted.
     * @param {string} key - Unique key      * associated with the action.
     */
    registerFail: (ipHash, action, key) => {
        const currentTime = Math.floor(Date.now() / 1000);
        db.prepare('INSERT INTO fails (ip_hash, action, key, time) VALUES (?, ?, ?, ?)').run(ipHash, action, key, currentTime);
    },

    /**
     * @description Retrieves a client's information by IP hash if they are currently blocked.
     * @param {Buffer} ipHash - The hashed IP address.
     * @returns {Object|null} - Client information or null if not found.
     */
    getActiveClientBlocked: (ipHash) => {
        const currentTime = Math.floor(Date.now() / 1000);
        const client = db.prepare('SELECT block_until as blockUntil FROM blocks WHERE ip_hash = ? AND block_until > ?').get(ipHash, currentTime);
        return client || null; // Return client data or null if not found
    },

    /**
     * @description Retrieves the last blocked information for a client by IP hash.
     * @param {Buffer} ipHash - The hashed IP address.
     * @returns {Object|null} - Client information or null if not found.
     */
    getLastClientBlocked: (ipHash) => {
        const client = db.prepare('SELECT block_until as blockUntil FROM blocks WHERE ip_hash = ? ORDER BY block_until DESC').get(ipHash);
        return client || null; // Return client data or null if not found
    },

    /**
     * @description Counts the number of blocks for a specific client by IP hash.
     * @param {Buffer} ipHash - The hashed IP address.
     * @returns {number} - Count of blocks.
     */
    getClientBlockCount: (ipHash) => {
        return db.prepare('SELECT COUNT(*) FROM blocks WHERE ip_hash = ?')
            .pluck()
            .get(ipHash);
    },

    /**
     * @description Inserts a new client block into the database.
     * @param {Buffer} ipHash - The hashed IP address.
     * @param {number} blockUntil - Block until time for the client.
     */
    addClientBlock: (ipHash, blockUntil) => {
        db.prepare('INSERT INTO blocks (ip_hash, block_until) VALUES (?, ?)').run(ipHash, blockUntil);
    },
}
/**
 * @description Cleans up expired entries from the database.
 */
function cleanup() {
    const currentTime = Math.floor(Date.now() / 1000);
    db.prepare('DELETE FROM blocks WHERE block_until < ?').run(currentTime - lifetime);
    db.prepare('DELETE FROM fails WHERE time < ?').run(currentTime - lifetime);
}

// Schedule cleanup of expired entries every hour
setInterval(cleanup, 3600000); // 3600000 milliseconds = 1 hour
