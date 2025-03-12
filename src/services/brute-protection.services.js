import bruteProtectionDriver from "../drivers/brute-protection.driver.js";
import { fingerprintString } from "../helpers/fingerprint-string.js";
import { parseIP } from "../helpers/ip-parser.js";
import secretService from "./secret.service.js";

const FREE_ATTEMPTS = 5; // Maximum number of allowed attempts for normal users
const ABUSER_FREE_ATTEMPTS = 2; // Maximum number of allowed attempts for suspected abusers

const BASE_WAIT_TIME = 5; // Base wait time in seconds (5 seconds)
const MAX_WAIT_TIME = 60 * 60 * 2; // Maximum wait time (2 hours)

// Initialize Fibonacci array and populate up to certain point
var fibonacciArray = [0,1,1];
for (let i = 2; MAX_WAIT_TIME > fibonacciArray[i]; i++) {
    fibonacciArray.push(fibonacciArray[i - 1] + fibonacciArray[i - 2]);
}

/**
 * @description Checks if a login attempt should be allowed based on previous failed attempts.
 * @param {Object} req - The request object containing the user's request data.
 * @param {string} action - The action being performed (e.g., "login").
 * @param {string} key - A unique key associated with the action (e.g., username).
 * @returns {Promise<number|boolean>} - Returns the actual wait time if the login attempt is denied, or true if allowed.
 */
async function check(req, action, key) {
    const addressHash = await fingerprintString(parseIP(req), await secretService.getEntry("IP_SALT", () => generateSecret(18)));
    
    const entry = bruteProtectionDriver.get(addressHash, action, key);

    // Determine if the action/key is a possible target or if the IP is a possible abuser
    const isActionKeyPossibleTarget = bruteProtectionDriver.countActionAndKeySpecific(action, key) > 5;
    const isIpPossibleAbuser = bruteProtectionDriver.countByIpHash(addressHash) > 20;

    const isPossibleAbuser = isActionKeyPossibleTarget || isIpPossibleAbuser;

    // Set the maximum allowed attempts based on whether the user is suspected of abuse
    const max = isPossibleAbuser ? ABUSER_FREE_ATTEMPTS : FREE_ATTEMPTS;

    // If the entry exists and the count exceeds the maximum allowed attempts
    if (entry && entry.count >= max) {
        // Calculate the wait time based on the number of attempts
        const waitTime = BASE_WAIT_TIME + array[Math.min(array.length-1,entry.count - max)];
        const lastAttemptTime = entry.lastUpdate; // Assuming time is stored in seconds

        // Check if the current time is less than the last attempt time plus the wait time
        const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
        const actualWaitTime = lastAttemptTime + waitTime - currentTime;

        if (actualWaitTime > 0) {
            return {blocked: true,waitTime:actualWaitTime}; // Too many attempts; user must wait
        }
    }
    
    return {blocked: false, count: entry ? entry.count : 0}; // The login attempt is allowed
}

/**
 * @description Records a failed login attempt.
 * @param {Object} req - The request object containing the user's request data.
 * @param {string} action - The action being performed (e.g., "login").
 * @param {string} key - A unique key associated with the action (e.g., username).
 */
async function addFail(req, action, key) {
    const addressHash = await fingerprintString(parseIP(req),await secretService.getEntry("IP_SALT", () => generateSecret(18)));

    const entry = bruteProtectionDriver.get(addressHash, action, key);
    if (entry) {
        bruteProtectionDriver.updateCount(addressHash, action, key, entry.count + 1);
    } else {
        bruteProtectionDriver.insert(addressHash, action, key);
    }
}

export default { check, addFail };
