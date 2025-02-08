import bcrypt from 'bcrypt';

/**
 * @description Hash a string using the bcrypt module
 * @param {String} [string]
 * @param {Number} [rounds]
 * @returns {String}
 */
export const hashString = async (string, rounds = 10) => {
    return await bcrypt.hash(string, rounds);
};
/**
 * @description Hash a password using the bcrypt module
 * @param {String} [string]
 * @returns {String}
 */
export const hashPassword = async (password) => {
    return await hashString(password, 12);
};
/**
 * @description Validate a hash for a string
 * @param {String} [string]
 * @param {String} [hash]
 * @returns {Boolean}
 */
export const isHashValid = async (string, hash) => {
    return await bcrypt.compare(string, hash);
};
