import dataDriver from "../drivers/data.driver.js";
import { Account } from "../models/accounts.js";
import { AuditActionType } from "../models/audit-action-types.js";

/**
 * @description Appends an audit log entry for a given account and action type.
 * If the account is null, the function returns early.
 * If an entry for the action type already exists, it increments the count;
 * otherwise, it inserts a new log entry. It also deletes any log entries
 * that match the replaceActionTypes specified in the actionType.
 * @param {Account} account - The account object containing account details.
 * @param {AuditActionType} actionType - The type of action being logged.
 */
function appendAuditLog(account, actionType) {
    if (account == null)
        return;
    if (!dataDriver.incrementAuditLogCountTimeBased(account.id, actionType))
        dataDriver.insertAuditLogEntry(account.id, actionType);
    actionType.replaceActionTypes.forEach(replaceAction => {
        dataDriver.deleteAuditLogEntriesTimeBased(account.id, replaceAction);
    });
}

/**
 * @description Retrieves the audit log for a specific account and action type since a given date.
 * @param {ObjeAccountct} account - The account object containing account details.
 * @param {AuditActionType} actionType - The type of action for which the log is retrieved.
 * @param {Number|null} since - The time in seconds from which to retrieve logs. Null or 0 to receive all logs.
 * @returns {Array<Object>} - An array of audit log entries.
 */
function getAuditLog(account, actionType, since) {
    return dataDriver.getAuditLog(account.id, actionType, since);
}

/**
 * @description Retrieves the full audit log for a specific account since a given date.
 * @param {Account} account - The account object containing account details.
 * @param {Number|null} since - The time in seconds from which to retrieve logs. Null or 0 to receive all logs.
 * @returns {Array<Object>} - An array of full audit log entries.
 */
function getFullAuditLog(account, since) {
    return dataDriver.getFullAuditLog(account.id, since);
}

/**
 * @description Retrieves the first entry of the full audit log for a specific account.
 * @param {Account} account - The account object containing account details.
 * @returns {Object|null} - The first audit log entry or null if no entries exist.
 */
function getFirstEntryFullAuditLog(account) {
    return dataDriver.getFirstEntryFullAuditLog(account.id);
}

export default {
    appendAuditLog,
    getAuditLog,
    getFullAuditLog,
    getFirstEntryFullAuditLog
};
