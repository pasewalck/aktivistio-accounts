/**
 * @description check if a string is alphanumeric
 * @param {String} [string]
 * @returns {Boolean}
 */
export function isAlphanumeric(string) {
    return string.toLowerCase().match(/^[0-9a-z]+$/) != null
}
/**
 * @description check if a string is alphanumeric lowercase
 * @param {String} [string]
 * @returns {Boolean}
 */
export function isAlphanumericLowerCase(string) {
    return string.match(/^[0-9a-z]+$/) != null
}
/**
 * @description check if a string is numeric
 * @param {String} [string]
 * @returns {Boolean}
 */
export function isNumeric(string) {
    return string.match(/^[0-9]+$/) != null
}
/**
 * @description check if a string is in range by length
 * @param {string} [string]
 * @param {Number} [min]
 * @param {Number} [max]
 * @returns {Boolean}
 */
export function isInLengthRange(string,min,max) {
    return min <= string.length && string.length <= max
}