import { AlphanumericCleaned, Alphanumeric } from "./character-arrays.js";

/**
 * @description returns a recovery string in a recovery token format
 * @returns {String}
 */
export const generateRecoveryToken = () => {
    let tokenList = [];
    for (let i = 0; i < 5; i++) {
        let section = ""
        for (let i = 0; i < 6; i++)
            section += getRandomCharFromString(Object.values(AlphanumericCleaned).join(''));
        tokenList.push(section);
    }
    return tokenList.join('-');
};
/**
 * @description return a random int using crypto module.Inspired by a solution from  https://stackoverflow.com/a/18230432
 * @param {Number} [min]
 * @param {Number} [max]
 * @returns {String}
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
 * @description Get a random character from an array of strings
 * @param {String[]} [strings]
 * @returns {String}
 */
export const getRandomCharFromStrings = (strings) => {
    return getRandomCharFromString(strings.join(''))
}
/**
 * @description Get a random character from a string
 * @param {String} [string]
 * @returns {String}
 */
export const getRandomCharFromString = (string) => {
    return string.charAt(Math.floor(randomInt(0, string.length-1)))
}
/**
 * @description Generate an alphanumeric secret
 * @param {Number} [length]
 * @param {Boolean} [cleaned]
 * @returns {String}
 */
export const generateSecret = (length=30,cleaned=false) => {
    let secret = "";
    for (let i = 0; i < length; i++)
        secret += getRandomCharFromStrings(Object.values(cleaned ? AlphanumericCleaned : Alphanumeric));
    return secret
};
/**
 * @description Generate an alphanumeric password
 * @param {Number} [length]
 * @returns {String}
 */
export const generatePassword = (length=20) => {
    let pwd = "";
    for (let i = 0; i < length; i++)
        pwd += getRandomCharFromStrings(Object.values(AlphanumericCleaned));
    return pwd
};
/**
 * @description Generate numeric code as a string
 * @param {Number} [length]
 * @returns {String}
 */
export const generateNumberCode = (length=8) => {
    let code = "";
    for (let i = 0; i < length; i++)
        code += getRandomCharFromString(Alphanumeric.Numbers);
 
    return code
};
/**
 * @description Generate an alphanumeric code with a ratio-based distribution between numbers and letters.
 * @param {Number} [length]
 * @returns {String}
 */
export const generateTypeableCode = (length=8,ratio=5) => {
    
    let code = "";
    for (let i = 0; i < length; i++)
        code += randomInt(0,10) <= ratio ? getRandomCharFromString(AlphanumericCleaned.Numbers) : getRandomCharFromStrings([AlphanumericCleaned.Lowers,AlphanumericCleaned.Uppers]);
 
    return code
};