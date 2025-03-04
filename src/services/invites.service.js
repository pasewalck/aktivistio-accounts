import { generateTypeableCode } from "../helpers/generate-secrets.js";
import { fingerprintString } from "../helpers/fingerprint-string.js";
import { Account } from "../models/accounts.js";
import userdataDriver from "../drivers/data.driver.js";
import secretService from "./secret.service.js";
/**
 * @description Retrieves invite codes for a specific account.
 * @param {Account} account - The user account.
 * @returns {Array<String>} - An array of invite codes associated with the user.
 */
function getForAccount(account) {
    return userdataDriver.getInvitesForAccountById(account.id);
}
/**
 * @description Retrieves invite codes for a specific account still locked due to not being valid yet.
 * @param {Account} account - The user account.
 * @returns {Array<String>} - An array invite codes.
 */
function getLockedForAccount(account) {
    return userdataDriver.getLockedInvitesForAccountById(account.id);
}
/**
 * @description Consumes (uses) a specified invite code.
 * @param {String} code - The invite code to consume.
 */
function consume(code) {
    userdataDriver.consumeInviteCode(code);
}
/**
 * @description Validates if a given invite code is valid.
 * @param {String} code - The invite code to validate.
 * @returns {Boolean} - True if the invite code is valid, false otherwise.
 */
function validate(code) {
    return userdataDriver.checkIfInviteCodeIsValid(code);
}
/**
 * @description Removes a specified invite code from the system.
 * @param {String} code - The invite code to remove.
 */
function remove(code) {
    userdataDriver.removeInviteCode(code);
}
/**
 * @description Generates a new invite code.
 * @param {Number} count
 * @param {{linkedAccount,validationDurationDays,maxUses,expireDate}} [options] - Options for invite code creation
 * @returns {Array<String>} - The generated invite code.
 */
function generateMultiple(count=3,options) {
    var array = [count]
    for (let i = 0; i < array.length; i++) {
        array[i] = generate(options)
    }
    return array
}
/**
 * Generates a new invite code.
 * @param {{linkedAccount: Account, validationDurationDays: Number, maxUses: Number, expireDate: Date}} options - Options for invite code creation.
 * @param {Account} [options.linkedAccount] - The account to link the invite code to (optional).
 * @param {Number} [options.validationDurationDays=0] - The Number of days the invite code is valid (optional).
 * @param {Number} [options.maxUses=1] - The maximum Number of times the invite code can be used (optional).
 * @param {Date} [options.expireDate=null] - The expiration date of the invite code (optional).
 * @returns {String} - The generated invite code.
 */
function generate(options = {}) {
    let code;

    // Generate a unique invite code that is valid
    do {
        code = generateTypeableCode(6);
    } while (!code || validate(code));

    // Calculate validation duration in seconds
    const validationDurationSeconds = (options.validationDurationDays || 0) * 60 * 60 * 24;
    // Calculate expiration date in seconds
    const expireDateSeconds = options.expireDate ? Math.floor(options.expireDate.getTime() / 1000) : null;

    // Store the invite code in the database
    userdataDriver.addInviteCode(code, options.maxUses || 1, validationDurationSeconds, expireDateSeconds);
    
    // Link the invite code to the user account if provided
    if (options.linkedAccount) {
        userdataDriver.linkInviteCodeToAccountById(code, options.linkedAccount.id);
    }

    return code;
}
/**
 * @description Requests an invite code for a given email address.
 * @param {String} email - The email address to request an invite code for.
 * @returns {String|Boolean} - The invite code or false if an error occurs.
 */
async function requestWithEmail(email) {
    const emailFingerprint = await fingerprintString(
        email,
        await secretService.getEntry("FINGERPRINT_SALT", () => generateSecret(18))
    );

    // Get any invite code that is already linked to the email fingerprint
    let inviteCode = userdataDriver.getInviteCodeByLinkedEmail(emailFingerprint);
    
    // If no invite code exists, generate a new one
    if (!inviteCode) {
        inviteCode = generateInviteCode();
        userdataDriver.linkInviteCodeToEmail(inviteCode, emailFingerprint);
    }
    
    return inviteCode;
}

export default {
    generate: {
        single: generate,
        multi: generateMultiple
    },
    getForAccount: {
        all: getForAccount,
        allLocked: getLockedForAccount
    },
    consume,
    validate,
    remove,
    requestWithEmail
}