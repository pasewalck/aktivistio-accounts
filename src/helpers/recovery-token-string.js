import { AlphanumericMoreReadable } from './character-arrays.js';
import { getRandomCharFromString } from './generate-secrets.js';

/**
 * @description Template for recovery token
 */
export const TOKEN_TEMPLATE = 'xxxxxx-xxxxxx-xxxxxx-xxxxxx-xxxxxx';
export const VALID_TOKEN_CHARS = Object.values(AlphanumericMoreReadable).join('');

/**
 * @description Generate a recovery token.
 * @returns {String} The generated recovery token.
 */
export const generateRecoveryToken = () => {
	return [...TOKEN_TEMPLATE]
		.map((char) => (char === 'x' ? getRandomCharFromString(VALID_TOKEN_CHARS) : char))
		.join('');
};

/**
 * @description Validates if a given string matches the recovery token format.
 * @param {String} string - The string to validate.
 * @returns {Boolean} True if the string is a valid recovery token, otherwise false.
 */
export const isRecoveryToken = (string) => {
	// Type check for input
	if (typeof string !== 'string' || string.length !== TOKEN_TEMPLATE.length) {
		return false;
	}

	const regex = /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+){4}$/; // Matches the pattern of the token

	// Validate format and individual characters
	return (
		regex.test(string) &&
		[...string].every((char, index) =>
			TOKEN_TEMPLATE[index] !== 'x' ? char === TOKEN_TEMPLATE[index] : VALID_TOKEN_CHARS.includes(char)
		)
	);
};
