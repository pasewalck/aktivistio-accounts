import { initDatabase } from "../helpers/database.js";
import env from "../helpers/env.js";
import { Account } from "../models/accounts.js";

const {db,isDbInit} = initDatabase("data",env.DATABASE_KEYS.DATA)

// Initialize the accounts table if it does not exist
db.exec(`
    create table IF NOT EXISTS accounts (
      id TEXT NOT NULL PRIMARY KEY,
      username TEXT NOT NULL,
      password_hash TEXT,
      recovery_token_hash TEXT,
      recovery_email_hash TEXT,
      role_id INTEGER NOT NULL,
      two_factor_secret TEXT
    );
`);

// Initialize the invites table if it does not exist
db.exec(`
    create table IF NOT EXISTS invites (
      code TEXT NOT NULL PRIMARY KEY,
      validation_date INTEGER NOT NULL DEFAULT (strftime('%s','now')),
      expire_date INTEGER DEFAULT NULL,
      usages INTEGER DEFAULT 1
    );
`);

// Initialize the email invite requests table if it does not exist
db.exec(`
    create table IF NOT EXISTS email_invite_requests (
      email_fingerprint INTEGER BLOB NOT NULL PRIMARY KEY,
      code TEXT REFERENCES invites (code) ON DELETE SET NULL
    );
`);

// Initialize the account invites table if it does not exist
db.exec(`
    create table IF NOT EXISTS account_invites (
      code TEXT REFERENCES invites (code) ON DELETE CASCADE,
      id TEXT REFERENCES accounts (id) ON DELETE CASCADE,
      PRIMARY KEY (code, id)
    );
`);

export default {
    /**
     * @description Retrieves invites associated with a specific user account by ID.
     * @param {String} id - The ID of the user account.
     * @returns {Array<Object>} - An array of invite objects containing validation date, code, usages, and expiration date.
     */
    getInvitesForAccountById: (id) => {
        return db.prepare(`
            SELECT invites.validation_date as createDate,
                   invites.code,
                   invites.usages,
                   invites.expire_date as expireDate 
            FROM invites, account_invites 
            WHERE invites.code = account_invites.code 
              AND account_invites.id = ? 
              AND strftime('%s','now') >= invites.validation_date 
              AND (invites.expire_date IS NULL OR strftime('%s','now') <= invites.expire_date) 
            ORDER BY invites.validation_date DESC
        `).all(id);
    },

    /**
     * @description Retrieves locked invites associated with a specific user account by ID.
     * @param {String} id - The ID of the user account.
     * @returns {Array<Object>} - An array of locked invite objects.
     */
    getLockedInvitesForAccountById: (id) => {
        return db.prepare(`
            SELECT invites.validation_date as createDate,
                   invites.code,
                   invites.usages,
                   invites.expire_date as expireDate 
            FROM invites, account_invites 
            WHERE invites.code = account_invites.code 
              AND account_invites.id = ? 
              AND strftime('%s','now') < invites.validation_date 
              AND (invites.expire_date IS NULL OR strftime('%s','now') <= invites.expire_date) 
            ORDER BY invites.validation_date
        `).all(id);
    },

    /**
     * @description Finds an account by its username.
     * @param {String} username - The username of the account.
     * @returns {Account|null} - The account object if found, otherwise null.
     */
    getAccountWithUsername: (username) => {
        let result = db.prepare('SELECT id, username, role_id as role FROM accounts WHERE username = ?').get(username);
        return result ? new Account(result.id, result.username, result.role) : null;
    },

    /**
     * @description Finds an account by its ID.
     * @param {String} id - The ID of the account.
     * @returns {Account|null} - The account object if found, otherwise null.
     */
    getAccountWithId: (id) => {
        let result = db.prepare('SELECT id, username, role_id as role FROM accounts WHERE id = ?').get(id);
        return result ? new Account(result.id, result.username, result.role) : null;
    },

    /**
     * @description Retrieves the password hash for an account by username.
     * @param {String} username - The username of the account.
     * @returns {String|null} - The password hash if found, otherwise null.
     */
    getAccountPasswordHashWithUsername: (username) => {
        return db.prepare('SELECT password_hash as passwordHash FROM accounts WHERE username = ?').pluck().get(username);
    },

    /**
     * @description Retrieves the password hash for an account by ID.
     * @param {String} id - The ID of the account.
     * @returns {String|null} - The password hash if found, otherwise null.
     */
    getAccountPasswordHashWithId: (id) => {
        return db.prepare('SELECT password_hash as passwordHash FROM accounts WHERE id = ?').pluck().get(id);
    },

    /**
     * @description Retrieves the two-factor authentication secret for an account by ID.
     * @param {String} id - The ID of the account.
     * @returns {String|null} - The two-factor secret if found, otherwise null.
     */
    getAccountTwoFactorSecretWithId: (id) => {
        return db.prepare('SELECT two_factor_secret as secret FROM accounts WHERE id = ?').pluck().get(id);
    },

    /**
     * @description Deletes an account by its ID.
     * @param {String} id - The ID of the account to be deleted.
     */
    deleteAccountById: (id) => {
        db.prepare('DELETE FROM accounts WHERE id = ?').run(id);
    },

    /**
     * @description Creates a new user account with the specified details.
     * @param {String} id - The ID of the new account.
     * @param {String} username - The username for the new account.
     * @param {number} role - The role ID associated with the new account.
     * @returns {Account} - The newly created account object.
     */
    createAccount: (id, username, role) => {
        db.prepare('INSERT INTO accounts (id, username, role_id) VALUES (?, ?, ?)').run(id, username, role);
    },

    /**
     * @description Get account recovery entries as JSON
     * @param {string} id - The ID of the account.
     * @returns {JSON} - JSON contsining token and email hashes/null values
     */
    getAccountRecoveryById: (id) => {
        return db.prepare('SELECT recovery_email_hash as email,recovery_token_hash as token FROM accounts WHERE id = ?').get(id);
    },

    /**
     * @description Retrieves the recovery email hash for an account by ID.
     * @param {String} id - The ID of the account.
     * @returns {String|null} - The recovery email hash if found, otherwise null.
     */
    getAccountRecoveryEmailHashById: (id) => {
        return db.prepare('SELECT recovery_email_hash FROM accounts WHERE id = ?').pluck().get(id);
    },

    /**
     * @description Retrieves the recovery token hash for an account by ID.
     * @param {String} id - The ID of the account.
     * @returns {String|null} - The recovery token hash if found, otherwise null.
     */
    getAccountRecoveryTokenHashById: (id) => {
        return db.prepare('SELECT recovery_token_hash FROM accounts WHERE id = ?').pluck().get(id);
    },

    /**
     * @description Sets the recovery email hash for an account by ID.
     * @param {String} id - The ID of the account.
     * @param {String|undefined} emailHash - The new recovery email hash to set.
     */
    setAccountRecoveryEmailHashById: (id, emailHash) => {
        db.prepare('UPDATE accounts SET recovery_email_hash = ? WHERE id = ?').run(emailHash, id);
    },

    /**
     * @description Sets the recovery token hash for an account by ID.
     * @param {String} id - The ID of the account.
     * @param {String|undefined} tokenHash - The new recovery token hash to set.
     */
    setAccountRecoveryTokenHashById: (id, tokenHash) => {
        db.prepare('UPDATE accounts SET recovery_token_hash = ? WHERE id = ?').run(tokenHash, id);
    },

    /**
     * @description Sets the two-factor authentication secret for an account by ID.
     * @param {String} id - The ID of the account.
     * @param {String|undefined} secret - The new two-factor authentication secret to set.
     */
    setAccountTwoFactorAuthSecretById: (id, secret) => {
        db.prepare('UPDATE accounts SET two_factor_secret = ? WHERE id = ?').run(secret, id);
    },

    /**
     * @description Sets the password hash for an account by ID.
     * @param {String} id - The ID of the account.
     * @param {String} passwordHash - The new password hash to set.
     */
    setAccountPasswordHashById: (id, passwordHash) => {
        db.prepare('UPDATE accounts SET password_hash = ? WHERE id = ?').run(passwordHash, id);
    },

    /**
     * @description Updates the role of an account by ID.
     * @param {String} id - The ID of the account.
     * @param {number} role - The new role ID to set.
     */
    setAccountRoleById: (id, role) => {
        db.prepare('UPDATE accounts SET role_id = ? WHERE id = ?').run(role, id);
    },

    /**
     * @description Retrieves all accounts from the database.
     * @returns {Array<Object>} - An array of account objects containing ID, username, and role.
     */
    getAllAccounts: () => {
        return db.prepare('SELECT id, username, role_id as role FROM accounts').all();
    },

    /**
     * @description Consumes a user invite by decrementing its usage count. If the usage count reaches zero, the invite is deleted from the database.
     * @param {String} code - The invite code to consume.
     */
    consumeInviteCode: (code) => {
        db.prepare('UPDATE invites SET usages = usages - 1 WHERE code = ?').run(code);
        db.prepare('DELETE FROM invites WHERE code = ? AND usages = 0').run(code);
    },

    /**
     * @description Checks if an invite code is valid based on its validation and expiration dates.
     * @param {String} code - The invite code to check.
     * @returns {boolean} - True if the invite code is valid, otherwise false.
     */
    checkIfInviteCodeIsValid: (code) => {
        return db.prepare(`
            SELECT code 
            FROM invites 
            WHERE code = ? 
              AND strftime('%s','now') >= invites.validation_date 
              AND (invites.expire_date IS NULL OR strftime('%s','now') <= invites.expire_date)
        `).pluck().get(code) != null;
    },

    /**
     * @description Removes an invite code from the database.
     * @param {String} code - The invite code to remove.
     */
    removeInviteCode: (code) => {
        db.prepare('DELETE FROM invites WHERE code = ?').run(code);
    },

    /**
     * @description Generates a new invite code with specified parameters and adds it to the database.
     * @param {String} code - The invite code to add.
     * @param {number} maxUses - The maximum number of times the invite can be used.
     * @param {number} validationDateSeconds - The number of seconds until the invite is valid.
     * @param {number} expireDateSeconds - The number of seconds until the invite expires (optional).
     * @returns {String} - The invite code that was added.
     */
    addInviteCode: (code, maxUses = 1, validationDateSeconds = Date.now() / 1000, expireDateSeconds=null) => {
        db.prepare(`
            INSERT INTO invites (code, usages, validation_date, expire_date) 
            VALUES (?, ?, strftime('%s','now') + ?, ?)
        `).run(code, maxUses, validationDateSeconds, expireDateSeconds);
    },

    /**
     * @description Links an invite code to a user account by ID.
     * @param {String} code - The invite code to link.
     * @param {String} userId - The ID of the user account to link the invite to.
     */
    linkInviteCodeToAccountById: (code, userId) => {
        db.prepare('INSERT INTO account_invites (code, id) VALUES (?, ?)').run(code, userId);
    },

    /**
     * @description Retrieves an invite code linked to a given email fingerprint.
     * @param {String} emailFingerprint - The fingerprint of the email to check.
     * @returns {String|null} - The invite code if found, otherwise null.
     */
    getInviteCodeByLinkedEmail: (emailFingerprint) => {
        return db.prepare('SELECT code FROM email_invite_requests WHERE email_fingerprint = ?').pluck().get(emailFingerprint);
    },

    /**
     * @description Links an invite code to a given email fingerprint.
     * @param {String} inviteCode - The invite code to link.
     * @param {String} emailFingerprint - The fingerprint of the email to link the invite to.
     */
    linkInviteCodeToEmail: (inviteCode, emailFingerprint) => {
        db.prepare('INSERT INTO email_invite_requests (email_fingerprint, code) VALUES (?, ?)').run(emailFingerprint, inviteCode);
    },
    isDbInit: isDbInit
};


