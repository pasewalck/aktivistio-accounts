/**
 * @description Generates a SHA-256 fingerprint for a given string combined with a salt.
 * This function encodes the input string and salt, computes the hash and returns the result as a Buffer.
 * @param {String} string - The input string to be hashed.
 * @param {String} salt - The salt to be added to the input string for hashing.
 * @returns {Promise<Buffer>} A promise that resolves to a Buffer containing the SHA-256 hash.
 */
export const fingerprintString = async (string, salt) => {
    // Encode the combined string and salt into a Uint8Array
    const buffer = new TextEncoder('utf-8').encode(string + salt);
    
    // Compute the SHA-256 hash of the encoded buffer
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    
    // Convert the hash buffer to a Node.js Buffer and return it
    return Buffer.from(hashBuffer);
};