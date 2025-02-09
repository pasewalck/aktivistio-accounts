/**
 * @description check if a string is alphanumeric
 * @param {String} [string]
 * @returns {Boolean}
 */
export function isAlphanumeric(string) {
    return string.match(/^[0-9a-z]+$/)
}
/**
 * @description check if a string is numeric
 * @param {String} [string]
 * @returns {Boolean}
 */
export function isNumeric(string) {
    return string.match(/^[0-9]+$/)
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