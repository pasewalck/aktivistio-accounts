import bruteProtectionDriver from "../drivers/brute-protection.driver.js";
import { fingerprintString } from "../helpers/fingerprint-string.js";
import { parseIP } from "../helpers/ip-parser.js";
import secretService from "./secret.service.js";

const FREE_ATTEMPTS = [
    [8, 3, 2, 2, 1],
    [3, 2, 1],
    [2, 1],
];
const WAIT_TIME_ARRAY_MAP = [
    [3,10,10,30,60*1,60*5,60*10,60*30,60*30,60*60*1,60*60*1,60*60*6],
    [3,10,60,60,60*2,60*5,60*15,60*30,60*60,60*60*6],
    [6,30,60,60,60*2,60*5,60*30,60*60,60*60,60*60*6],
    [9,60,60,60,60*3,60*9,60*30,60*60,60*60,60*60*6],
]

const ipSalt = await secretService.getEntry("IP_SALT", () => generateSecret(10));

/**
 * @description Generates a hash for the client's IP address.
 * @param {Object} req - The request object containing the client's IP.
 * @returns {Promise<string>} - A promise that resolves to the fingerprint hash of the IP address.
 */
async function getAddressHash(req) {
    return await fingerprintString(parseIP(req), ipSalt);
}

/**
 * @description Checks if the client is blocked based on their address hash.
 * @param {string} addressHash - The hashed IP address of the client.
 * @returns {Promise<{ isBlocked: boolean, waitTime?: number, blockUntil?: number }>} - An object indicating if the client is blocked and the wait time if applicable.
 */
async function doCheck(addressHash) {
    const client = bruteProtectionDriver.getActiveClientBlocked(addressHash);
    if (client) {
        const currentTime = Math.floor(Date.now() / 1000);
        const waitTime = client.blockUntil - currentTime;
        if (waitTime > 0) return { isBlocked: true, waitTime: waitTime, blockUntil: client.blockUntil };
    }
    return { isBlocked: false };
}

/**
 * @description Adds a client block.
 * @param {string} addressHash - The hashed IP address of the client.
 * @param {number} waitTime - The wait time for blocking.
 * @returns {Promise<{ isBlocked: boolean, blockUntil: number }>} - An object indicating if the client is blocked and the block until time.
 */
async function addClientBlock(addressHash, waitTime) {
    const currentTime = Math.floor(Date.now() / 1000);
    const blockUntil = currentTime + waitTime;

    await bruteProtectionDriver.addClientBlock(addressHash, blockUntil);

    return { isBlocked: true, blockUntil: blockUntil };
}

/**
 * @description Registers a failed attempt for the client and apply block if needed.
 * @param {string} addressHash - The hashed IP address of the client.
 * @param {string} action - The action that failed.
 * @param {string} [key] - An optional key associated with the action.
 * @returns {Promise<{ isBlocked: boolean, waitTime?: number, blockUntil?: number }>} - An object indicating if the client is blocked and the wait time if applicable.
 */
async function addFail(addressHash, action, key) {
    if (key === undefined || key === null) key = null;

    bruteProtectionDriver.registerFail(addressHash, action, key);

    const clientBlock = bruteProtectionDriver.getLastClientBlocked(addressHash);
    const blockCount = bruteProtectionDriver.getClientBlockCount(addressHash);

    const attemptsSinceBlock = clientBlock ?
        bruteProtectionDriver.failCountActionSpecific(addressHash, action,clientBlock.blockUntil) :
        bruteProtectionDriver.failCountActionSpecific(addressHash, action);

    const failsOtherForKey = key ? bruteProtectionDriver.failCountKeySpecific(key,addressHash) : null;
    const failsOtherForAddress = bruteProtectionDriver.failCountByIpHash(addressHash,action);

    const currentRiskLevel = failsOtherForKey + failsOtherForAddress;

    const freeAttemptArray = FREE_ATTEMPTS[Math.min(currentRiskLevel, FREE_ATTEMPTS.length - 1)];
    const freeAttemptCount = freeAttemptArray[Math.min(blockCount, freeAttemptArray.length - 1)];

    console.log(freeAttemptCount,attemptsSinceBlock,currentRiskLevel,blockCount)

    if (attemptsSinceBlock >= freeAttemptCount) 
    {
        const waitTimeArray = WAIT_TIME_ARRAY_MAP[Math.round(Math.min(WAIT_TIME_ARRAY_MAP.length - 1, currentRiskLevel))]
        const waitTime = waitTimeArray[Math.round(Math.min(waitTimeArray.length - 1, blockCount))]
        return await addClientBlock(addressHash, waitTime);
    }

    return { isBlocked: false };
}

export default { doCheck, addFail, getAddressHash };
