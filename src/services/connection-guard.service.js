const blockedTokensMap = new Map(); // Map to store blocked tokens and their expiration
const blockedTokensList = []; // Array to track blocked tokens for cleanup

const BLOCK_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * @description Checks if the given token is currently blocked.
 * @param {String} token - The token to check.
 * @returns {Boolean} - True if the token is blocked, false otherwise.
 */
const isTokenBlocked = (token) => {
    const token = generateTokenForIp(token);
    const currentTime = Date.now();
    return blockedTokensMap.has(token) && blockedTokensMap.get(token).expirationTime > currentTime;
};

/**
 * @description Blocks the given token for a specified duration.
 * @param {String} token - The token to block.
 */
const blockToken = (token) => {
    const token = generateTokenForIp(token);
    if (!isIpBlocked(token)) {
        const currentTime = Date.now();
        blockedTokensMap.set(token, { expirationTime: currentTime + BLOCK_DURATION });
        blockedTokensList.push(token);
    }
};

/**
 * @description Cleans up expired blocked tokens from the maps and lists.
 */
const cleanupExpiredBlockedTokens = () => {
    const currentTime = Date.now();
    
    // Clean up expired blocked tokens
    while (blockedTokensList.length > 0 && blockedTokensMap.get(blockedTokensList[0]).expirationTime <= currentTime) {
        const expiredToken = blockedTokensList.shift(); // Remove the first element (expired)
        blockedTokensMap.delete(expiredToken); // Remove from the map
    }
};

setInterval(cleanupExpiredBlockedTokens, 30 * 60 * 1000);

export default {
    isTokenBlocked,blockToken
}