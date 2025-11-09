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
 * along with "Aktivistio Accounts". If not, see https://www.gnu.org/licenses/.
 *
 * Copyright (C) 2025 Jana Caroline Pasewalck
 */
/**
 * Enum for Account Roles.
 * @readonly
 * @enum {number}
 */
export class Role {
    static USER = 0;
    static MULTIPLIER = 1;
    static MULTIPLIER_UNLIMITED = 2;
    static MODERATOR = 3;
    static ADMIN = 4;
    static SUPER_ADMIN = 5;

    /**
     * @description Get all defined roles as an array.
     * @returns {Array<number>} - An array of all role values.
     */
    static all() {
        return [
            Role.USER,
            Role.MULTIPLIER,
            Role.MULTIPLIER_UNLIMITED,
            Role.MODERATOR,
            Role.ADMIN,
            Role.SUPER_ADMIN
        ];
    }

    /**
     * @description Get all roles that are lower than the specified role.
     * @param {number} roleCompare - The role to compare against.
     * @returns {Array<number>} - An array of roles that are lower than the specified role.
     */
    static allLower(roleCompare) {
        return Role.all().filter(role => role < roleCompare); // Use filter for cleaner code
    }

    /**
     * @description Get the display name and color for a given role.
     * @param {number} role - The role to get information for.
     * @returns {{name: string, color: string}} - An object containing the display name and color of the role.
     */
    static getRoleInfo(role) {
        const roleInfo = {
            [Role.USER]: { name: "User", color: "#3498db" },
            [Role.MULTIPLIER]: { name: "Multiplier", color: "#2ecc71" },
            [Role.MULTIPLIER_UNLIMITED]: { name: "Unlimited Multiplier", color: "#f39c12" },
            [Role.MODERATOR]: { name: "Moderator", color: "#e67e22" },
            [Role.ADMIN]: { name: "Admin", color: "#e74c3c" },
            [Role.SUPER_ADMIN]: { name: "Super Admin", color: "#9b59b6" }
        };
        return roleInfo[role] || { name: "Unknown Role", color: "#7f8c8d" };
    }
}

/**
 * Defines the hierarchy of roles.
 * @type {Object<number, Array<number>>}
 */
export const roleHierarchy = {
    [Role.USER]: [],
    [Role.MULTIPLIER]: [Role.USER],
    [Role.MULTIPLIER_UNLIMITED]: [Role.MULTIPLIER],
    [Role.MODERATOR]: [Role.MULTIPLIER_UNLIMITED],
    [Role.ADMIN]: [Role.MODERATOR],
    [Role.SUPER_ADMIN]: [Role.ADMIN]
};

/**
 * Enum for Permissions.
 * @readonly
 * @enum {string}
 */
export class Permission {
    static REGENERATING_INVITES = 'REGENERATING_INVITES';
    static MANAGE_OWN_INVITES = 'MANAGE_OWN_INVITES';
    static MANAGE_USERS = 'MANAGE_USERS';
    static RECOVER_USERS = 'RECOVER_USERS';
    static DELETE_USERS = 'DELETE_USERS';
    static MANAGE_SERVICES = 'MANAGE_SERVICES';
}

/**
 * Defines the permissions associated with each role.
 * @type {Object<number, Array<string>>}
 */
export const rolePermissions = {
    [Role.USER]: [],
    [Role.MULTIPLIER]: [Permission.REGENERATING_INVITES],
    [Role.MULTIPLIER_UNLIMITED]: [Permission.MANAGE_OWN_INVITES],
    [Role.MODERATOR]: [Permission.MANAGE_USERS],
    [Role.ADMIN]: [Permission.MANAGE_SERVICES, Permission.DELETE_USERS, Permission.RECOVER_USERS],
    [Role.SUPER_ADMIN]: []
};

/**
 * @description Check if a role has a specific permission.
 * @param {number} role - The role to check.
 * @param {string} permission - The permission to check for.
 * @returns {boolean} - True if the role has the permission, otherwise false.
 */
export function hasPermission(role, permission) {
    // Check if the role has the permission directly
    if (rolePermissions[role].includes(permission)) {
        return true;
    }
    // Check parent roles for the permission
    const parentRoles = roleHierarchy[role];
    return parentRoles.some(parentRole => hasPermission(parentRole, permission));
}
