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
 * Copyright (C) 2025 Jana Caroline Pasewalck
 */
import { initDatabase } from "../helpers/database.js";
import env from "../helpers/env.js";

const {db} = initDatabase("secrets",env.DATABASE_KEYS.SECRETS)

// Initialize tables for the storage
db.exec(`
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
    return db.prepare('SELECT value, created FROM secrets WHERE name = ? ORDER BY created DESC').all(name);
}

/**
 * @description Get entry from secret storage
 * @param {String} name - The name of the secret
 * @param {Integer} createdBefore - The time before which to delete entries
 * @returns {Array<{}>} - An array of secret values
 */
function cleanEntries(name,createdBefore) {
    db.prepare(`DELETE FROM secrets WHERE created < ? AND name = ?`).run(createdBefore,name);
}

/**
 * @description get entry
 * @param {String} [name]
 * @param {String} [value]
 * @returns {JSON|String}
 */
function addEntry (name,value) {
    db.prepare('INSERT INTO secrets (name,value) VALUES (?,?)').run(name,value);
}

export default {
    getEntries,cleanEntries,addEntry
}
