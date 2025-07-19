/**
 * Represents a user account in the application.
 * This class holds information about the account, including its unique identifier, username, and associated role.
 * @class Account
 */
export class Account {
    /**
     * @description Initializes a new account with the specified id, username, and roleId.
     * @constructor
     * @param {string} id - The unique identifier for the account.
     * @param {string} username - The username associated with the account.
     * @param {number} roleId - The role identifier associated with the account.
     * @param {boolean} isActive
     */
    constructor(id, username, roleId, isActive) {
        this.id = id;
        this.username = username;
        this.role = roleId;
        this.isActive = isActive;
    }
}