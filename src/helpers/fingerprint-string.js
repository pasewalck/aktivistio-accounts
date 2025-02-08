/**
 * @description Generate a fingerprint for a given string and a salt
 * @param {String} [string]
 * @param {String} [salt]
 * @returns {ArrayBuffer}
 */
export const fingerprintString = async (string, salt) => {
    const buffer = new TextEncoder('utf-8').encode(string + salt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    return hashBuffer;
};
