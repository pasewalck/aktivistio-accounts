const ipTokenMap = new Map(); // Map to store IP tokens and their expiration
const ipExpirationList = []; // Array to track IP addresses and their expiration times

const TOKEN_EXPIRATION_TIME = 60 * 60 * 1000; // 1 hour in milliseconds

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
        ipTokenMap.set(ipAddress, { token, expirationTime: currentTime + TOKEN_EXPIRATION_TIME });
        ipExpirationList.push(ipAddress);
    } else {
        const entry = ipTokenMap.get(ipAddress);
        if (entry.expirationTime <= currentTime) {
            const token = crypto.randomUUID();
            ipTokenMap.set(ipAddress, { token, expirationTime: currentTime + TOKEN_EXPIRATION_TIME });

            while (expirationList.length > 0)
            {
                const entry = expirationList[0];
                expirationList.shift();
                if(entry == ipAddress)
                    break;
            }
            ipExpirationList.push(ipAddress);
        }
    }

    return ipTokenMap.get(ipAddress).token;
};

/**
 * @description Cleans up expired tokens from the maps and lists.
 */
const cleanupExpiredTokens = () => {
    const currentTime = Date.now();
    
    // Clean up expired IP tokens
    while (ipExpirationList.length > 0 && ipTokenMap.get(ipExpirationList[0]).expirationTime <= currentTime) {
        const expiredIpAddress = ipExpirationList.shift(); // Remove the first element (expired)
        ipTokenMap.delete(expiredIpAddress); // Remove from the map
    }
};

setInterval(cleanupExpiredTokens, 30 * 60 * 1000);

export default {
    tokenForIp
}