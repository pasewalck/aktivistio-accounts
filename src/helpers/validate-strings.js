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
 * @description Checks if a string is alphanumeric (contains only letters and numbers).
 * @param {String} string - The string to check.
 * @returns {Boolean} True if the string is alphanumeric, otherwise false.
 */
export function isAlphanumeric(string) {
    return /^[0-9a-zA-Z]+$/.test(string);
}

/**
 * @description Checks if a string is alphanumeric and in lowercase (contains only lowercase letters and numbers).
 * @param {String} string - The string to check.
 * @returns {Boolean} True if the string is alphanumeric and lowercase, otherwise false.
 */
export function isAlphanumericLowerCase(string) {
    return /^[0-9a-z]+$/.test(string);
}

/**
 * @description Checks if a string is numeric (contains only digits).
 * @param {String} string - The string to check.
 * @returns {Boolean} True if the string is numeric, otherwise false.
 */
export function isNumeric(string) {
    return /^[0-9]+$/.test(string);
}

/**
 * @description Checks if a string's length is within a specified range.
 * @param {String} string - The string to check.
 * @param {Number} min - The minimum length.
 * @param {Number} max - The maximum length.
 * @returns {Boolean} True if the string's length is within the range, otherwise false.
 */
export function isInLengthRange(string, min, max) {
    return string.length >= min && string.length <= max;
}
