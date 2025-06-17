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