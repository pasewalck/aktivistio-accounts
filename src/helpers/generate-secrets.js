import { AlphanumericMoreReadable, Alphanumeric } from "./character-arrays.js";

/**
 * @description Returns a random integer between min and max (inclusive) using the crypto module.
 * Inspired by a solution from https://stackoverflow.com/a/18230432
 * @param {Number} min - The minimum value of the random integer.
 * @param {Number} max - The maximum value of the random integer.
 * @returns {Number} A random integer between min and max.
 */
const randomInt = (min, max) => {       
    var byteArray = new Uint8Array(1);
    crypto.getRandomValues(byteArray);

    var range = max - min + 1;
    var max_range = 256;
    if (byteArray[0] >= Math.floor(max_range / range) * range)
        return randomInt(min, max);
    return min + (byteArray[0] % range);
}

/**
 * @description Get a random character from an array of strings.
 * @param {String[]} strings - An array of strings to choose from.
 * @returns {String} A random character from the concatenated strings.
 */
export const getRandomCharFromStrings = (strings) => {
    return getRandomCharFromString(strings.join(''));
}

/**
 * @description Get a random character from a string.
 * @param {String} string - The string to choose a character from.
 * @returns {String} A random character from the string.
 */
export const getRandomCharFromString = (string) => {
    return string.charAt(randomInt(0, string.length - 1));
}

/**
 * @description Generate an alphanumeric secret of a specified length.
 * @param {Number} [length] - The length of the secret to generate (Default is 30).
 * @param {Boolean} [moreReadable] - Whether to use the more readable alphanumeric collection (Default is false).
 * @returns {String} The generated alphanumeric secret.
 */
export const generateAlphanumericSecret = (length = 30, moreReadable = false) => {
    const charSet = Object.values(moreReadable ? AlphanumericMoreReadable : Alphanumeric).join('');
    return Array.from({ length }, () => getRandomCharFromString(charSet)).join('');
};
/**
 * @description Generate an alphanumeric password of a specified length.
 * @param {Number} [length] - The length of the password to generate (Default is 20).
 * @returns {String} The generated alphanumeric password.
 */
export const generatePassword = (length = 20) => {
    const charSet = Object.values(AlphanumericMoreReadable).join('');
    return Array.from({ length }, () => getRandomCharFromString(charSet)).join('');
};

/**
 * @description Generate a numeric code as a string of a specified length.
 * @param {Number} [length] - The length of the numeric code to generate (Default is 8).
 * @returns {String} The generated numeric code.
 * @throws {Error} Throws an error if length is less than 1.
 */
export const generateNumberCode = (length = 8) => {
    if (length < 1)
        throw new Error("Length must be at least 1.");
    return Array.from({ length }, () => getRandomCharFromString(Alphanumeric.Numbers)).join('');
};

/**
 * @description Generate an alphanumeric code with a ratio-based distribution between numbers and letters with focus on it being typeable.
 * @param {Number} [length] - The length of the code to generate (Default is 8).
 * @param {Number} [ratio] - The ratio of numbers to letters in the generated code (Can be between 0 and 10. Default is 5).
 * @returns {String} The generated typeable code.
 * @throws {Error} Throws an error if length is less than 1 or ratio is negative or bigger than 10.
 */
export const generateTypeableCode = (length = 8, ratio = 5) => {
    if (length < 1) {
        throw new Error("Length must be at least 1.");
    }
    if (ratio < 0) {
        throw new Error("Ratio cannot be negative.");
    }
    if (ratio > 10) {
        throw new Error("Ratio cannot be above 10.");
    }
    let code = "";
    for (let i = 0; i < length; i++) {
        // Randomly determine whether to add a number or a letter based on the ration
        code += randomInt(0, 10) <= ratio 
            ? getRandomCharFromString(AlphanumericMoreReadable.Numbers) 
            : getRandomCharFromStrings([AlphanumericMoreReadable.Lowers, AlphanumericMoreReadable.Uppers]);
    }
    return code;
};

/**
 * @description Generate a random ascii string.
 * @param {Number} [length] - The length of the string to generate (Default is 40).
 * @returns {String} The generated string.
 */
export function generateRandomAsciiString(length=40) {
    const randomValues = new Uint8Array(length);
    crypto.getRandomValues(randomValues);    
    const asciiString = String.fromCharCode(...randomValues);
    return asciiString
}