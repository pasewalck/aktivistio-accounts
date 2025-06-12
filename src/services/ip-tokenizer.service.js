const ipTokenMap = new Map(); // Map to store IP tokens and their last access time
const TOKEN_LIFETIME = 60 * 60 * 1000 * 2; // 2 hours in milliseconds
const MOVING_WINDOW_TIME = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * @description Generates a unique token for a given IP address.
 * @param {String} ipAddress - The IP address to tokenize.
 * @returns {String} - The generated token for the IP address.
 */
const tokenForIp = (ipAddress) => {
    const currentTime = Date.now();

    // Check if the IP address is not already tokenized
    if (!ipTokenMap.has(ipAddress)) {
        const token = crypto.randomUUID();
        ipTokenMap.set(ipAddress, { token, lastAccessTime: currentTime });
    } else {
        const entry = ipTokenMap.get(ipAddress);
        // Update the last access time
        entry.lastAccessTime = currentTime;

        // Move the accessed entry to the end of the Map
        ipTokenMap.delete(ipAddress); // Remove the entry
        ipTokenMap.set(ipAddress, entry); // Reinsert it to move it to the end
    }

    return ipTokenMap.get(ipAddress).token;
};

/**
 * @description Cleans up tokens that haven't been accessed within the moving window.
 */
const cleanupExpiredTokens = () => {
    const currentTime = Date.now();

    // Iterate through the Map to find expired tokens
    for (const [ipAddress, entry] of ipTokenMap) {
        // Check if the token hasn't been accessed within the moving window
        if (entry.lastAccessTime <= currentTime - MOVING_WINDOW_TIME) {
            ipTokenMap.delete(ipAddress); // Remove expired token
        } else {
            // If we find a valid entry, break out of the loop
            break;
        }
    }
};

// Set an interval to clean up expired tokens every 30 minutes
setInterval(cleanupExpiredTokens, 30 * 60 * 1000);

export default {
    tokenForIp
}
