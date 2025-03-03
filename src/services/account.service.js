import { generatePassword } from "../helpers/generate-secrets.js";
import logger from "../helpers/logger.js";
import { Account } from "../models/accounts.js";
import userdataDriver from "../drivers/data.driver.js";
import twoFactorAuth from "../helpers/two-factor-auth.js";
import { hashPassword, isHashValid } from "../helpers/hash-string.js";
import invitesService from "./invites.service.js";
import { Role } from "../models/roles.js";

/**
 * @description Finds an account by username.
 * @param {String} username - The username of the account to find.
 * @returns {Account|null} - The found account or null if not found.
 */
function findWithUsername(username) {
    const result = userdataDriver.getAccountWithUsername(username);
    return result ? new Account(result.id, result.username, result.role) : null;
}

/**
 * @description Finds an account by ID.
 * @param {String} id - The ID of the account to find.
 * @returns {Account|null} - The found account or null if not found.
 */
function findWithId(id) {
    const result = userdataDriver.getAccountWithId(id);
    return result ? new Account(result.id, result.username, result.role) : null;
}

/**
 * @description Checks if the login credentials are valid and return account if they are valid.
 * @param {String} username - The username of the account.
 * @param {String} password - The password to validate.
 * @returns {Promise<Account|Boolean>} - The account if valid, false otherwise.
 */
async function checkLogin(username, password) {
    const passwordHash = userdataDriver.getAccountPasswordHashWithUsername(username);
    return (passwordHash && await isHashValid(password, passwordHash)) ? findWithUsername(username) : false;
}

/**
 * @description Get account recovery entries as JSON
 * @param {Account} account - The account
 * @returns {JSON} - JSON contsining token and email hashes/null values
 */
function getRecovery(account) {
    return userdataDriver.getAccountRecoveryById(account.id)
}
/**
 * Validates the recovery email for an account.
 * @param {Account} account - The account.
 * @param {String} email - The recovery email to validate.
 * @returns {Promise<Boolean>} - True if valid, false otherwise.
 */
async function checkRecoveryEmail(account, email) {
    const emailHash = userdataDriver.getAccountRecoveryEmailHashById(account.id);
    return emailHash && await isHashValid(email, emailHash);
}

/**
 * Validates the recovery token for an account.
 * @param {Account} account - The account.
 * @param {String} token - The recovery token to validate.
 * @returns {Promise<Boolean>} - True if valid, false otherwise.
 */
async function checkRecoveryToken(account, token) {
    const tokenHash = userdataDriver.getAccountRecoveryTokenHashById(account.id);
    return tokenHash && await isHashValid(token, tokenHash);
}

/**
 * Checks if the password for an account is valid.
 * @param {Account} account - The account.
 * @param {String} password - The password to validate.
 * @returns {Promise<Boolean>} - True if valid, false otherwise.
 */
async function checkPassword(account, password) {
    const passwordHash = userdataDriver.getAccountPasswordHashWithId(account.id);
    return passwordHash && await isHashValid(password, passwordHash);
}

/**
 * Purges (deletes) an account.
 * @param {Account} account - The account to delete.
 */
function purge(account) {
    userdataDriver.deleteAccountById(account.id);
    logger.info(`Deleted account ${account.username}`);
}

/**
 * Retrieves the two-factor authentication secret for an account.
 * @param {Account} account - The account.
 * @returns {JSON} - The two-factor authentication secret.
 */
function getTwoFactorSecret(account) {
    return userdataDriver.getAccountTwoFactorSecretWithId(account.id);
}

/**
 * Retrieves the two-factor authentication secret for an account.
 * @param {Account} account - The account.
 * @param {String} token - The two factor token
 * @returns {JSON} - The two-factor authentication secret.
 */
function checkTwoFactorSecret(account,token) {
    return twoFactorAuth.verify(userdataDriver.getAccountTwoFactorSecretWithId(account.id),token)
}


/**
 * Creates a new user account.
 * @param {String} username - The username for the new account.
 * @param {Number} role - The role of the new account.
 * @returns {Promise<Account>} - The created account.
 */
async function create(username, role) {
    const accountId = crypto.randomUUID();
    userdataDriver.createAccount(accountId, username, role);
    logger.info(`Created an account ${username}`);
    return findWithUsername(username);
}

/**
 * Sets up account recovery with email and token.
 * @param {Account} account - The account.
 * @param {String|undefined} email - The recovery email.
 * @param {String|undefined} token - The recovery token.
 */
async function setRecovery(account, email, token) {
    await setAccountRecoveryEmail(account, email);
    await setAccountRecoveryToken(account, token);
}

/**
 * Sets the recovery email for an account.
 * @param {Account} account - The account.
 * @param {String|undefined} email - The recovery email to set.
 */
async function setRecoveryEmail(account, email) {
    const emailHash = email ? await hashPassword(email) : null;
    setRecoveryEmailHash(account, emailHash);
}

/**
 * Sets the recovery email hash for an account.
 * @param {Account} account - The account.
 * @param {String|undefined} emailHash - The hashed recovery email.
 */
function setRecoveryEmailHash(account, emailHash) {
    userdataDriver.setAccountRecoveryEmailHashById(account.id, emailHash);
}

/**
 * Sets the recovery token for an account.
 * @param {Account} account - The account.
 * @param {String|undefined} token - The recovery token to set.
 */
async function setRecoveryToken(account, token) {
    const tokenHash = token ? await hashPassword(token) : null;
    setRecoveryTokenHash(account, tokenHash);
}

/**
 * Sets the recovery token hash for an account.
 * @param {Account} account - The account.
 * @param {String|undefined} tokenHash - The hashed recovery token.
 */
async function setRecoveryTokenHash(account, tokenHash) {
    userdataDriver.setAccountRecoveryTokenHashById(account.id, tokenHash);
}

/**
 * Sets the two-factor authentication secret for an account.
 * @param {Account} account - The account.
 * @param {String} secret - The two-factor authentication secret to set.
 */
async function setTwoFactorAuthSecret(account, secret) {
    userdataDriver.setAccountTwoFactorAuthSecretById(account.id, secret);
}

/**
 * Sets the password for an account.
 * @param {Account} account - The account.
 * @param {String} password - The new password to set.
 */
async function setPassword(account, password) {
    const passwordHash = await hashPassword(password);
    setPasswordHash(account, passwordHash);
}

/**
 * Sets the role for an account.
 * @param {Account} account - The account.
 * @param {Number} role - The new role to assign to the account.
 */
function setRole(account, role) {
    userdataDriver.setAccountRoleById(account.id, role);
}

/**
 * Sets the password hash for an account.
 * @param {Account} account - The account.
 * @param {String} passwordHash - The hashed password to set.
 */
function setPasswordHash(account, passwordHash) {
    userdataDriver.setAccountPasswordHashById(account.id, passwordHash);
}

/**
 * Retrieves all accounts in the system.
 * @returns {Array<Account>} - An array of all accounts.
 */
function getAll() {
    return userdataDriver.getAllAccounts().map(result => new Account(result.id, result.username, result.role));
}

// Initialization block for creating an administration account if the database is initialized
if (userdataDriver.isDbInit) {
    logger.debug(`Creating administration account`);

    const user = "admin";
    const password = generatePassword();

    const account = await create(user, Role.SUPER_ADMIN);
    await setPassword(account, password);
    
    // Generate invite codes for the admin account
    invitesService.generate.multi(3,{linkedAccount:account});

    logger.info(`Created user "${user}" with Password: "${password}"`);
}

export default {
    find: {
        withId: findWithId,
        withUsername: findWithUsername
    },
    password: {
        set: setPassword,
        setHash: setPasswordHash,
        check: checkPassword
    },
    recovery: {
        get: getRecovery,
        set: setRecovery,
        email: {
            check: checkRecoveryEmail,
            set: setRecoveryEmail,
            setHash: setRecoveryEmailHash
        },
        token: {
            check: checkRecoveryToken,
            set: setRecoveryToken,
            setHash: setRecoveryTokenHash
        }
    },
    twoFactorAuth: {
        check: checkTwoFactorSecret,
        get: getTwoFactorSecret,
        set: setTwoFactorAuthSecret
    },
    getAll,
    checkLogin,
    create: create,
    purge: purge,
    setRole: setRole
}
