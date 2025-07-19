import { initDatabase } from "../helpers/database.js";
import env from "../helpers/env.js";
import { Account } from "../models/accounts.js";
import { AuditActionType } from "../models/audit-action-types.js";
import { ActionTokenTypes } from "../models/action-token-types.js";

const {db,isDbInit} = initDatabase("data",env.DATABASE_KEYS.DATA)

// Initialize the accounts table if it does not exist
db.exec(`
    create table IF NOT EXISTS accounts (
      id TEXT NOT NULL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT,
      recovery_token_hash TEXT,
      recovery_email_hash TEXT,
      role_id INTEGER NOT NULL,
      two_factor_secret TEXT,
      is_active INTEGER NOT NULL DEFAULT 0
    );
`);

// Initialize the action tokens table if it does not exist
db.exec(`
    CREATE TABLE IF NOT EXISTS action_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        token TEXT NOT NULL UNIQUE,
        token_type TEXT NOT NULL,
        payload TEXT,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
        expires_at INTEGER NOT NULL
    );
`);

// Initialize the accounts audit log table if it does not exist
db.exec(`
    create table IF NOT EXISTS audit_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
        start_time INTEGER NOT NULL,
        end_time INTEGER NOT NULL,
        action_type_id INTEGER NOT NULL,
        count INTEGER NOT NULL DEFAULT 1
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
      email_fingerprint BLOB NOT NULL PRIMARY KEY,
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
     * @description Inserts a new entry into the audit log.
     * @param {String} accountId - The ID of the account.
     * @param {Boolean} success - Indicates if the action was successful.
     * @param {AuditActionType} actionType - The type of action.
     */
    insertAuditLogEntry: (accountId, actionType) => {
        return db.prepare(`
            INSERT INTO audit_log (account_id, action_type_id, start_time, end_time)
            VALUES (?, ?, strftime('%s','now'), strftime('%s','now'))
        `).run(accountId, actionType.id);
    },

    /**
     * @description Saves a token with its associated metadata and expiration time
     * @param {ActionTokenTypes} tokenType - The type of action token (e.g., password reset)
     * @param {string} token - The unique token value to be saved
     * @param {number} expiresAt - Unix timestamp indicating when the token expires
     * @param {Object} payload - Additional JSON-serializable data associated with the token
     * @returns {Object} - Database insertion result
     */
    insertActionToken: (tokenType, token, expiresAt, payload) => {
        return db.prepare(`
            INSERT INTO action_tokens (token_type, token, expires_at, payload)
            VALUES (?, ?, ?, ?)
        `).run(tokenType, token, expiresAt, JSON.stringify(payload));
    },

    /**
     * @description Removes a token entry based on its type and value
     * @param {ActionTokenTypes} tokenType - The type of action token to delete
     * @param {string} token - The specific token value to be deleted
     * @returns {Object} - Database deletion result
     */
    deleteActionTokenEntry: (tokenType, token) => {
        return db.prepare(`
            DELETE FROM action_tokens 
            WHERE token_type = ? AND token = ?
        `).run(tokenType,token);
    },


    /**
     * @description Fetches a token entry that matches the type and value and is not expired
     * @param {ActionTokenTypes} tokenType - The type of action token to retrieve
     * @param {string} token - The specific token value to search for
     * @returns {Object|null} - Returns the token entry with parsed payload, or null if not found
     */
    getActionTokenEntry: (tokenType,token) => {
        const entry = db.prepare(`
            SELECT token,token_type as tokenType,expires_at as expiresAt,payload FROM action_tokens
            WHERE token_type = ? AND token = ? AND expires_at > strftime('%s','now')
        `).get(tokenType,token);
        if(entry)
            entry.payload = JSON.parse(entry.payload)
        return entry;
    },

    /**
     * @description Increments the count for a specific audit log entry based on action type and account ID.
     * @param {String} accountId - The ID of the account.
     * @param {AuditActionType} actionType - The type of action.
     * @returns {Boolean} - Returns true if the count was incremented, false if no entry was found.
     */
    incrementAuditLogCountTimeBased: (accountId, actionType) => {
        const result = db.prepare(`
            UPDATE audit_log 
            SET count = count + 1, end_time = strftime('%s','now')
            WHERE action_type_id = ? AND account_id = ? AND start_time >= strftime('%s', 'now', '-15 minutes')
        `).run(actionType.id, accountId);

        return result.changes > 0;
    },

    /**
     * @description Deletes entries from the audit log based on action type and account ID.
     * @param {AuditActionType} actionType - The type of action.
     * @param {String} accountId - The ID of the account.
     * @returns {Boolean} - Returns true if entries were deleted, false if no entries were found.
     */
    deleteAuditLogEntriesTimeBased: (accountId, actionType) => {
        const result = db.prepare(`
            DELETE FROM audit_log 
            WHERE action_type_id = ? AND account_id = ? AND start_time >= strftime('%s', 'now', '-15 minutes')
        `).run(actionType.id, accountId);

        return result.changes > 0;
    },

    /**
     * @description Deletes an entry from the audit log by ID.
     * @param {Number} id - The ID of the audit log entry to delete.
     */
    deleteAuditLogEntry: (id) => {
        return db.prepare(`
            DELETE FROM audit_log WHERE id = ?
        `).run(id);
    },

    /**
     * @description Retrieves the most recent audit log entry for a specific account.
     * @param {String} accountId - The ID of the account.
     * @returns {Object} - An object representing an audit log entry.
     */
    getFirstEntryFullAuditLog: (accountId) => {
        const log = db.prepare(`
            SELECT end_time as time,count,action_type_id as actionTypeId, account_id as accountId
            FROM audit_log
            WHERE account_id = ? ORDER BY end_time
        `).get(accountId)
        
        return log ? {
                time: log.time,
                count: log.count,
                actionType: AuditActionType.byId(log.actionTypeId),
                accountId: log.accountId,
                clientIdentifier: log.clientIdentifier
        } : null;
    },

    /**
     * @description Retrieves the full audit log for a specific account, filtered by time.
     * @param {String} accountId - The ID of the account.
     * @param {Number|null} since - Filter event by time.
     * @returns {Array<Object>} - An array of objects representing audit log entries.
     */
    getFullAuditLog: (accountId,since) => {
        const auditLogs = db.prepare(`
            SELECT end_time as time,count,action_type_id as actionTypeId, account_id as accountId
            FROM audit_log
            WHERE account_id = ? AND end_time >= ?
        `).all(accountId, since ? since : 0);
        
        return auditLogs.map(log => {
            const actionInfo = AuditActionType.byId(log.actionTypeId);
            return {
                time: log.time,
                count: log.count,
                actionType: actionInfo, // Replace ID with the action object
                accountId: log.accountId,
                clientIdentifier: log.clientIdentifier
            };
        });
    },

    /**
     * @description Retrieves the audit log for a specific account, filtered by time and actionType.
     * @param {String} accountId - The ID of the account.
     * @param {AuditActionType} actionType - The type of action.
     * @param {Number|null} since - Filter event by time.
     * @returns {Array<Object>} - An array of objects representing audit log entries.
     */
    getAuditLog: (accountId,actionType,since) => {
        const auditLogs = db.prepare(`
            SELECT end_time as time,count,action_type_id as actionTypeId, account_id as accountId FROM audit_log
            WHERE account_id = ? AND action_type_id = ? AND end_time >= ?
        `).all(accountId,actionType.id,since ? since : 0);

        return auditLogs.map(log => {
            const actionInfo = AuditActionType.byId(log.actionTypeId);
            return {
                time: log.time,
                count: log.count,
                actionType: actionInfo,
                accountId: log.accountId,
                clientIdentifier: log.clientIdentifier
            };
        });
    },

    /**
     * @description Sums up all counts of audit log entries for a specific account, filtered by time and actionType.
     * @param {String} accountId - The ID of the account.
     * @param {AuditActionType} actionType - The type of action.
     * @param {Number|null} since - Filter event by time.
     * @returns {Number} - The sum of counts of audit log entries.
     */
    sumAuditLogCounts: (accountId, actionType, since) => {
        const result = db.prepare(`
            SELECT SUM(count) as totalCount FROM audit_log
            WHERE account_id = ? AND action_type_id = ? AND end_time >= ?
        `).get(accountId, actionType.id, since ? since : 0);
        return result.totalCount || 0;
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
     * @param {Blob} emailFingerprint - The fingerprint of the email to check.
     * @returns {String|null} - The invite code if found, otherwise null.
     */
    getInviteCodeEntryByLinkedEmail: (emailFingerprint) => {
        return db.prepare('SELECT code FROM email_invite_requests WHERE email_fingerprint = ?').get(emailFingerprint);
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

function regularCleanup(db) {
    const now = Math.floor(Date.now() / 1000); // Current timestamp in seconds

    // Clean up expired action tokens
    db.prepare(`
        DELETE FROM action_tokens 
        WHERE expires_at < ?
    `).run(now);

    // Clean up expired invites
    db.prepare(`
        DELETE FROM invites 
        WHERE expire_date IS NOT NULL AND expire_date < ?
    `).run(now);

    // Clean up unused or expired email invite requests
    db.prepare(`
        DELETE FROM email_invite_requests 
        WHERE code IS NULL OR code NOT IN (
            SELECT code FROM invites 
            WHERE expire_date IS NULL OR expire_date > ?
        )
    `).run(now);

    // Optional: Clean up account invites associated with expired invites
    db.prepare(`
        DELETE FROM account_invites 
        WHERE code NOT IN (
            SELECT code FROM invites 
            WHERE expire_date IS NULL OR expire_date > ?
        )
    `).run(now);

    // Clean up very old audit log entries (e.g., older than 1 year)
    db.prepare(`
        DELETE FROM audit_log 
        WHERE end_time < ?
    `).run(now - (365 * 24 * 60 * 60)); // 1 year ago
}

setInterval(regularCleanup, 1000 * 60 * 60); // Every hour
