/* 
 * This file is part of "Aktivistio Accounts".
 *
 * The project "Aktivistio Accounts" implements an account system and 
 * management platform combined with an OAuth 2.0 Authorization Server.
 *
 * "Aktivistio Accounts" is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * "Aktivistio Accounts" is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with "Aktivistio Accounts". If not, see <https://www.gnu.org/licenses/>.
 *
 * Copyright (C) 2025 Jana
 */
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
     * @param {number|null} lastLogin
     */
    constructor(id, username, roleId, isActive, lastLogin) {
        this.id = id;
        this.username = username;
        this.role = roleId;
        this.isActive = isActive;
        this.lastLogin = lastLogin ? lastLogin : null;
    }
}
