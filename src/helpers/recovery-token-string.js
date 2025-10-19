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
import { AlphanumericMoreReadable } from "./character-arrays.js";
import { getRandomCharFromString } from "./generate-secrets.js";

/**
 * @description Template for recovery token
 * The template uses 'x' to be filled with random alphanumeric characters
 */
const TOKEN_TEMPLATE = "xxxxxx-xxxxxx-xxxxxx-xxxxxx-xxxxxx";

/**
 * @description Generate a recovery token.
 * @returns {String} The generated recovery token.
 */
export const generateRecoveryToken = () => {
    const token = [];

    for (let i = 0; i < TOKEN_TEMPLATE.length; i++) {
        // If the current character in the template is 'x', replace it with a random character
        // Otherwise, keep the character from the template
        const currentChar = TOKEN_TEMPLATE[i];
        token.push(currentChar !== "x" ? currentChar : getRandomCharFromString(Object.values(AlphanumericMoreReadable).join('')));
    }

    return token.join('');
};

/**
 * @description Validates if a given string matches the recovery token format.
 * @param {String} string - The string to validate.
 * @returns {Boolean} True if the string is a valid recovery token, otherwise false.
 */
export const isRecoveryToken = (string) => {
    // Check if the length of the string matches the token template
    if (string.length !== TOKEN_TEMPLATE.length) {
        return false;
    }

    for (let i = 0; i < TOKEN_TEMPLATE.length; i++) {
        const templateChar = TOKEN_TEMPLATE[i];
        const currentChar = string[i];

        // Validate character based on the template
        if (templateChar !== "x") {
            // If the template character is not 'x', it must match exactly
            if (currentChar !== templateChar) {
                return false;
            }
        } else {
            // If the template character is 'x', it must be an alphanumeric character
            if (!Object.values(AlphanumericMoreReadable).join('').includes(currentChar)) {
                return false;
            }
        }
    }

    return true;
};
