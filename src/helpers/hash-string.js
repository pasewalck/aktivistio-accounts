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
import argon2 from 'argon2';

/**
 * @description Hashes a string using the argon2 module.
 * @param {String} string - The string to be hashed.
 * @param {Number} [rounds=10] - The number of salt rounds to use for hashing (default is 10).
 * @returns {Promise<String>} A promise that resolves to the hashed string.
 */
export const hashString = async (string, rounds = 10) => {
    return await argon2.hash(string, rounds);
};

/**
 * @description Hashes a password using the argon2 module with a higher number of salt rounds.
 * @param {String} password - The password to be hashed.
 * @returns {Promise<String>} A promise that resolves to the hashed password.
 */
export const hashPassword = async (password) => {
    return await hashString(password, 12); // Using 12 rounds for password hashing
};

/**
 * @description Validates a hash against a string.
 * @param {String} string - The string to validate.
 * @param {String} hash - The hash to compare against.
 * @returns {Promise<Boolean>} A promise that resolves to true if the hash is valid, otherwise false.
 */
export const isHashValid = async (string, hash) => {
    return await argon2.verify(hash,string);
};
