import dbDriver from "./db.driver.js";

import {generatePassword, generateTypeableCode} from "../helpers/generate-secrets.js"
import { fingerprintString } from "../helpers/fingerprint-string.js";
import { hashString, hashPassword, isHashValid } from '../helpers/hash-string.js';
import config from "../config.js";
import logger from "../logger.js";

// Initialize tables for accounts
dbDriver.db.exec(`
    create table IF NOT EXISTS accounts (
      id text not null PRIMARY KEY,
      username text not null,
      password_hash text not null,
      recovery_token_hash text,
      recovery_email_hash text,
      role_id INTEGER not null,
      two_factor_secret text
    );
`)
// Initialize tables for invites
dbDriver.db.exec(`
    create table IF NOT EXISTS invites (
      code text not null PRIMARY KEY,
      validation_date int NOT NULL DEFAULT (strftime('%s','now')),
      expire_date int DEFAULT NULL,
      usages int DEFAULT 1
    );
`)
// Initialize tables for invites
dbDriver.db.exec(`
    create table IF NOT EXISTS email_invite_requests (
      email_fingerprint BLOB not null PRIMARY KEY,
      code text REFERENCES invites (code) ON DELETE SET NULL
    );
`)
// Initialize tables for invites linking to accounts
dbDriver.db.exec(`
    create table IF NOT EXISTS account_invites (
      code text REFERENCES invites (code) ON DELETE CASCADE,
      id text REFERENCES accounts (id) ON DELETE CASCADE,
      PRIMARY KEY (code, id)
    );
`)
/**
 * Enum for Account Roles.
 * @readonly
 * @enum {{name: string, id: string}}
 */
class Role {
    static USER = 0;
    static MULTIPLIER = 1;
    static MULTIPLIER_UNLIMITED = 2;
    static MODERATOR = 3;
    static ADMIN = 4;
    static SUPER_ADMIN = 5;

    /**
     * @description return whether a user role can regenerate invites
     * @param {Number} [role]
     * @returns {Boolean}
     */
    static canRegenerateInvites(role) {
        return [Role.MULTIPLIER].includes(role);
    }
    /**
     * @description return whether a user role can manage other user's roles
     * @param {Number} [role]
     * @returns {Boolean}
     */
    static canManageUsersRoles(role) {
        return [Role.ADMIN,Role.MODERATOR,Role.SUPER_ADMIN].includes(role);;
    }

    /**
     * @description return whether a user role can generate invites
     * @param {Number} [role]
     * @returns {Boolean}
     */
    static canGenerateInvites(role) {
        return [Role.MULTIPLIER_UNLIMITED,Role.ADMIN,Role.MODERATOR,Role.SUPER_ADMIN].includes(role);
    }

    /**
     * @description return whether a user role can manage other users
     * @param {Number} [role]
     * @returns {Boolean}
     */
    static canManageUsers(role) {
        return [Role.ADMIN,Role.SUPER_ADMIN].includes(role);;
    }

    /**
     * @description return whether a user role can manage admin users
     * @param {Number} [role]
     * @returns {Boolean}
     */
    static canManageAdmins(role) {
        return [Role.ADMIN,Role.SUPER_ADMIN].includes(role);;
    }
}
/**
 * Represents an account.
 * @class [Account account]
 */
class Account {

    /**
     * @constructor
     * @param {String} [id]
     * @param {String} [username]
     * @param {Number} [role=0]
     */
    constructor (id,username,role=Role.USER) {
        this.id = id
        this.username = username
        this.role = role
    }

    /**
     * @description get invites for a specific user
     * @returns {array}
     */
    getInvites() {
        return dbDriver.db.prepare("SELECT invites.validation_date as createDate,invites.code,invites.usages,invites.expire_date as expireDate FROM invites,account_invites WHERE invites.code = account_invites.code AND account_invites.id = ? AND strftime('%s','now') >= invites.validation_date AND (invites.expire_date IS NULL OR strftime('%s','now') <= invites.expire_date) ORDER BY invites.validation_date DESC").all(this.id);
    }
    /**
     * @description get locked invites
     * @returns {array}
     */
    getLockedInvites() {
        return dbDriver.db.prepare("SELECT invites.validation_date as createDate,invites.code,invites.usages,invites.expire_date as expireDate FROM invites,account_invites WHERE invites.code = account_invites.code AND account_invites.id = ? AND strftime('%s','now') < invites.validation_date AND (invites.expire_date IS NULL OR strftime('%s','now') <= invites.expire_date) ORDER BY invites.validation_date").all(this.id);
    }

    
}
/**
 * @description find an account by providing username
 * @param {string} [username]
 * @returns {Account}
 */
function findAccountWithUsername(username) {
    let result = dbDriver.db.prepare('SELECT id,username,role_id as role FROM accounts WHERE username = ?').get(username);
    return result ? new Account(result.id,result.username,result.role) : undefined;
}
/**
 * @description find an account by providing id
 * @param {string} [id]
 * @returns {Account}
 */
function findAccountWithId(id) {
    let result = dbDriver.db.prepare('SELECT id,username,role_id as role FROM accounts WHERE id = ?').get(id);
    return result ? new Account(result.id,result.username,result.role) : undefined;
}
/**
 * @description check if a login is valid
 * @param {string} [username]
 * @param {string} [password]
 * @returns {(Boolean|Account)}
 */
async function checkLogin(username,password) {
    let result = dbDriver.db.prepare('SELECT id,username,password_hash as passwordHash,role_id as role FROM accounts WHERE username = ?').get(username);
    return result && await isHashValid(password,result.passwordHash) ? new Account(result.id,result.username,result.role) : false;
}
/**
 * @description check if a recovery is valid
 * @param {string} [id]
 * @param {string} [password]
 * @returns {(Boolean)}
 */
async function checkRecoveryEmail(id,email) {
    let emailHash = dbDriver.db.prepare('SELECT recovery_email_hash FROM accounts WHERE id = ?').pluck().get(id);
    return emailHash && await isHashValid(email,emailHash) ? true : false;
}
/**
 * @description check if a recovery is valid
 * @param {string} [id]
 * @param {string} [token]
 * @returns {(Boolean)}
 */
async function checkRecoveryToken(id,token) {
    let tokenHash = dbDriver.db.prepare('SELECT recovery_token_hash FROM accounts WHERE id = ?').pluck().get(id);
    return tokenHash && await isHashValid(token,tokenHash) ? true : false;
}
/**
 * @description check if a password for account is valid
 * @param {string} [id]
 * @param {string} [password]
 * @returns {(Boolean|Account)}
 */
async function checkPassword(id,password) {
    let result = dbDriver.db.prepare('SELECT id,username,password_hash as passwordHash FROM accounts WHERE id = ?').get(id);
    return result && await isHashValid(password,result.passwordHash) ? true : false;
}
/**
 * @description consume a user invite
 * @param {string} [code]
 */
function consumeInvite (code) {
    dbDriver.db.prepare('UPDATE invites SET usages = usages - 1 WHERE code = ?').run(code);
    dbDriver.db.prepare('DELETE FROM invites WHERE code = ? AND usages = 0').run(code);
}
/**
 * @description delete Account
 * @param {string} [id]
 */
function deleteAccount (id) {
    const account = findAccountWithId(id)
    dbDriver.db.prepare('DELETE FROM accounts WHERE id = ?').run(id);
    logger.info(`Deleted account ${account.username}`)
}

/**
 * @description check if an invite is valid
 * @param {string} [code]
 * @returns {Boolean}
 */
function validateInvite(code) {
    return dbDriver.db.prepare('SELECT code FROM invites WHERE code = ?').pluck().get(code) != null;
}
/**
 * @description get recovery setup for account
 * @param {string} [id]
 * @returns {JSON}
 */
function get2faSecret(id) {
    return dbDriver.db.prepare('SELECT two_factor_secret as secret FROM accounts WHERE id = ?').pluck().get(id);
}
/**
 * @description get recovery setup for account
 * @param {string} [id]
 * @returns {JSON}
 */
function getRecovery(id) {
    return dbDriver.db.prepare('SELECT recovery_email_hash as email,recovery_token_hash as token FROM accounts WHERE id = ?').get(id);
}
/**
 * @description create a new user
 * @param {string} [username]
 * @param {string} [password]
 * @param {Number} [role]
 * @returns {Account}
 */
async function createAccount (username,password,role) {
    dbDriver.db.prepare('INSERT INTO accounts (id,username, password_hash, role_id) VALUES (?,?,?,?)').run(crypto.randomUUID(),username,await hashPassword(password), role);
    const account = findAccountWithUsername(username);

    logger.info(`Created an account ${account.username}`)

    return account;
}
/**
 * @description set account recovery
 * @param {string} [id]
 * @param {string|undefined} [email]
 * @param {string|undefined} [token]
 */
async function setAccountRecovery (id,email,token) {
    await setAccountRecoveryEmail(id,email)
    await setAccountRecoveryToken(id,token)
}
/**
 * @description set account recovery email
 * @param {string} [id]
 * @param {string|undefined} [email]
 */
async function setAccountRecoveryEmail (id,email) {
    dbDriver.db.prepare('UPDATE accounts SET recovery_email_hash = ? WHERE id = ?').run(email ? await hashPassword(email) : null, id);
}
/**
 * @description set account 2fa secret
 * @param {string} [id]
 * @param {string|undefined} [email]
 */
async function setAccount2fa (id,secret) {
    dbDriver.db.prepare('UPDATE accounts SET two_factor_secret = ? WHERE id = ?').run(secret, id);
}
/**
 * @description set account recovery token
 * @param {string} [id]
 * @param {string|undefined} [token]
 */
async function setAccountRecoveryToken (id,token) {
    dbDriver.db.prepare('UPDATE accounts SET recovery_token_hash = ? WHERE id = ?').run(token ? await hashPassword(token) : null, id);
}
/**
 * @description create a new user
 * @param {string} [id]
 * @param {string} [password]
 */
async function setPassword (id,password) {
    dbDriver.db.prepare('UPDATE accounts SET password_hash = ?WHERE id = ?').run(await hashPassword(password), id);
}
/**
 * @description remove invite
 * @param {string} [code]
 */
function removeInvite (code) {
    dbDriver.db.prepare('DELETE FROM invites WHERE code = ?').run(code);
}
/**
 * @description generate invite
 * @param {Account} [user=null]
 * @param {Number} [maxUses=1]
 * @param {Date} [expireDate=null]
 * @returns {String}
 */
function generateInvite (user = null,validationDurationDays=0,maxUses=1,expireDate=null) {

    var code;
    while(!code || validateInvite(code))
    {
        code = generateTypeableCode(6)
    }
    var validationDurationSeconds = validationDurationDays * 60 * 60 * 24
    var expireDateSeconds = expireDate ? expireDate.getTime() / 1000 : null;
    dbDriver.db.prepare("INSERT INTO invites (code,usages,validation_date,expire_date) VALUES (?,?,strftime('%s','now')+?,?)").run(code,maxUses,validationDurationSeconds,expireDateSeconds);
    if(user)
        dbDriver.db.prepare('INSERT INTO account_invites (code,id) VALUES (?,?)').run(code,user.id)

    return code
}

/**
 * @description reaquest an invite for an given email
 * @param {string} email
 * @returns {string|bool}
 */
async function requestInvite(email) {
    const emailFingerprint = await fingerprintString(email,config.fingerprintSalt)
    
    var inviteCode = dbDriver.db.prepare('SELECT code FROM email_invite_requests WHERE email_fingerprint = ?').pluck().get(emailFingerprint)
    
    if (!inviteCode) {
        inviteCode = generateInvite()
        dbDriver.db.prepare('INSERT INTO email_invite_requests (email_fingerprint,code) VALUES (?,?)').run(emailFingerprint,inviteCode);
    }
    
    return inviteCode;
}

if (dbDriver.isDbInit)
{
    logger.debug(`Creating administration account`)

    let user = "admin"
    let password = generatePassword()

    let account = await createAccount(user,password,Role.SUPER_ADMIN)
    
    for (let index = 0; index < 3; index++)
        generateInvite(account)

    logger.info(`Created user "${user}" with Password: "${password}"`)
}
export default {
    createAccount,removeInvite,requestInvite,getRecovery,checkRecoveryEmail,checkRecoveryToken,generateInvite,get2faSecret,deleteAccount,setAccount2fa,setAccountRecoveryToken,setAccountRecoveryEmail,setPassword,checkPassword,validateInvite,consumeInvite,checkLogin,findAccountWithUsername,findAccountWithId,setAccountRecovery,Role,Account
}