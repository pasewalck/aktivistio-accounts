/* 
 * This file is part of "Aktivistio Accounts".
 *
 * The project "Aktivistio Accounts" implements an account system and 
 * management platform combined with an OAuth 2.0 Authorization Server.
 *
 * "Aktivistio Accounts" is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * "Aktivistio Accounts" is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with "Aktivistio Accounts". If not, see https://www.gnu.org/licenses/.
 *
 * Copyright (C) 2025 Jana
 */
import { initDatabase } from "../helpers/database.js";
import env from "../helpers/env.js";

// Initialize the database connection for the OIDC storage
const { db } = initDatabase("oidc", env.DATABASE_KEYS.OIDC);

// Create tables for storing entries and their lookups if they do not already exist
db.exec(`
    CREATE TABLE IF NOT EXISTS entries (
        id TEXT,
        model TEXT NOT NULL,
        value TEXT NOT NULL,
        expire INTEGER,
        PRIMARY KEY (model, id)
    );
    CREATE TABLE IF NOT EXISTS entries_lookup (
        entry_id TEXT,
        entry_model TEXT,
        name TEXT NOT NULL,
        lookup_value TEXT NOT NULL,
        PRIMARY KEY (name, entry_model, lookup_value, entry_id),
        FOREIGN KEY (entry_id, entry_model) REFERENCES entries (id, model) ON DELETE CASCADE
    );
`);

/**
 * @description Remove an entry from storage by its ID.
 * @param {string} model - The model associated with the entry.
 * @param {string} id - The ID of the entry to remove.
 */
function removeEntry(model, id) {
    db.prepare('DELETE FROM entries WHERE model = ? AND id = ?').run(model, id);
}

/**
 * @description Retrieve the value of an entry from storage by its ID.
 * @param {string} model - The model associated with the entry.
 * @param {string} id - The ID of the entry to retrieve.
 * @returns {string|null} - The value of the entry, or null if not found or expired.
 */
function getEntryValue(model, id) {
    return db.prepare('SELECT value FROM entries WHERE model = ? AND id = ? AND (expire is null OR expire >= ?)').pluck().get(model, id, Math.floor(Date.now() / 1000));
}

/**
 * @description Retrieve the valuues/all entries of a model from storage.
 * @param {string} model - The model to lookup.
 * @returns {string|null} - The value of the entry, or null if not found or expired.
 */
function getEntriesValues(model) {
    return db.prepare('SELECT value FROM entries WHERE model = ? AND (expire is null OR expire >= ?)').pluck().all(model, Math.floor(Date.now() / 1000));
}

/**
 * @description Insert a new entry into storage.
 * @param {string} model - The model associated with the entry.
 * @param {string} id - The ID of the entry.
 * @param {string} value - The value of the entry.
 * @param {number|null} expire - Optional expiration timestamp (in seconds).
 */
function insertEntry(model, id, value, expire = null) {
    db.prepare('INSERT INTO entries (model, id, value, expire) VALUES (?, ?, ?, ?)').run(model, id, value, expire ? expire : null);
}
/**
 * @description Update the value of an existing entry in storage.
 * @param {string} model - The model associated with the entry.
 * @param {string} id - The ID of the entry to update.
 * @param {string} value - The new value for the entry.
 */
function setEntryValue(model, id, value) {
    db.prepare('UPDATE entries SET value = ? WHERE model = ? AND id = ?').run(value, model, id);
}

/**
 * @description Update the expiration timestamp of an existing entry.
 * @param {string} model - The model associated with the entry.
 * @param {string} id - The ID of the entry to update.
 * @param {number} expire - The new expiration timestamp (in seconds).
 */
function setEntryExpire(model, id, expire) {
    db.prepare('UPDATE entries SET expire = ? WHERE model = ? AND id = ?').run(expire, model, id);
}

/**
 * @description Add a lookup value for an entry in storage.
 * @param {string} model - The model associated with the entry.
 * @param {string} id - The ID of the entry.
 * @param {string} name - The name of the lookup lookup value.
 * @param {string} lookupValue - The lookup value of the lookup.
 */
function addLookupValueForEntry(model, id, name, lookupValue) {
    db.prepare('INSERT INTO entries_lookup (entry_model, entry_id, name, lookup_value) VALUES (?, ?, ?, ?)').run(model, id, name, lookupValue);
}

/**
 * @description Update a lookup value for an entry in storage.
 * @param {string} model - The model associated with the entry.
 * @param {string} name - The name of the lookup lookupc value to update.
 * @param {string} lookupValue - The new lookup value for the lookup.
 * @param {string} id - The new ID of the entry.
 */
function updateLookupValueForEntry(model, name, lookupValue, id) {
    db.prepare('UPDATE entries_lookup SET entry_id = ? WHERE entry_model = ? AND name = ? AND lookup_value = ?').run(id, model, name, lookupValue);
}

/**
 * @description Retrieve the entry ID based on a lookup value.
 * @param {string} model - The model associated with the entry.
 * @param {string} name - The name of the lookup lookup value.
 * @param {string} lookupValue - The lookup value of the lookup.
 * @returns {string|null} - The entry ID, or null if not found.
 */
function getEntryIdByLookup(model, name, lookupValue) {
    return db.prepare('SELECT entry_id FROM entries_lookup WHERE entry_model = ? AND name = ? AND lookup_value = ?').pluck().get(model, name, lookupValue);
}

/**
 * @description Retrieve the entries IDs based on a lookup value.
 * @param {string} model - The model associated with the entry.
 * @param {string} name - The name of the lookup lookup_value.
 * @param {string} lookup_value - The lookup_value of the lookup.
 * @returns {string|null} - The entry ID, or null if not found.
 */
function getEntriesIdsByLookup(model, name, lookup_value) {
    return db.prepare('SELECT entry_id FROM entries_lookup WHERE entry_model = ? AND name = ? AND lookup_value = ?').pluck().all(model, name, lookup_value);
}

/**
 * @description Remove expired entries from storage.
 */
function cleanupExpiredEntries() {
    const currentTime = Math.floor(Date.now() / 1000); // Get the current time in seconds since epoch
    db.prepare('DELETE FROM entries WHERE expire < ? AND expire is not null').run(currentTime); // Delete expired entries
}

// Schedule cleanup of expired entries every hour
setInterval(cleanupExpiredEntries, 3600000); // 3600000 milliseconds = 1 hour

export default {
    removeEntry,
    getEntryValue,
    setEntryExpire,
    setEntryValue,
    insertEntry,
    getEntriesValues,
    addLookupValueForEntry,
    getEntryIdByLookup,
    updateLookupValueForEntry,
    getEntriesIdsByLookup
};
