const ipTokenMap = new Map(); // In-memory map to store IP tokens
const expirationList = []; // In-memory array to store expiration times and corresponding IP addresses

const EXPIRATION_TIME = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * @description Tokenizes an IP address by generating a unique token.
 * @param {String} ipAddress - The IP address to tokenize.
 * @returns {String} - The tokenized IP address.
 */
export const getToken = (ipAddress) => {
    // Check if the IP address is not already tokenized
    if (!ipTokenMap.has(ipAddress)) {
        const token = crypto.randomUUID()
        ipTokenMap.set(ipAddress, token);

        const currentTime = Date.now();
        // Add expiration time to the list
        expirationList.push({ ipAddress, expirationTime: currentTime + EXPIRATION_TIME });
    }

    return ipTokenMap.get(ipAddress);
};

/**
 * @description Cleans up expired tokens from the map and the expiration list.
 */
export const cleanupExpired = () => {
    const currentTime = Date.now();
    
    while (expirationList.length > 0 && expirationList[0].expirationTime <= currentTime) {
        const { ipAddress } = expirationList.shift(); // Remove the first element (expired)
        ipTokenMap.delete(ipAddress); // Remove from the map
    }
};

// Optional: Set an interval to clean up expired tokens every 10 minutes
setInterval(cleanupExpired, 30 * 60 * 1000);
