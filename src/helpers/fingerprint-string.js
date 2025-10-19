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
 * along with "Aktivistio Accounts". If not, see <https://www.gnu.org/licenses/>.
 *
 * Copyright (C) 2025 Jana
 */
/**
 * @description Generates a SHA-256 fingerprint for a given string combined with a salt.
 * This function encodes the input string and salt, computes the hash and returns the result as a Buffer.
 * @param {String} string - The input string to be hashed.
 * @param {String} salt - The salt to be added to the input string for hashing.
 * @returns {Promise<Buffer>} A promise that resolves to a Buffer containing the SHA-256 hash.
 */
export const fingerprintString = async (string, salt) => {
    // Encode the combined string and salt into a Uint8Array
    const buffer = new TextEncoder('utf-8').encode(string + salt);
    
    // Compute the SHA-256 hash of the encoded buffer
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    
    // Convert the hash buffer to a Node.js Buffer and return it
    return Buffer.from(hashBuffer);
};
