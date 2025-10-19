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
 * Enum for Audit Action Types.
 * @readonly
 * @class
 */
export class AuditActionType {

    static REGISTER = { 
        id: 0, 
        type: 'REGISTER', 
        displayName: 'User Registration Completed', 
        alertLevel: 0,
        replaceActionTypes: []
    };

    static LOGIN_FAIL = { 
        id: 2, 
        type: 'LOGIN_FAIL', 
        displayName: 'User Login Attempt Blocked', 
        alertLevel: 1,
        replaceActionTypes: []
    };

    static LOGIN_2FA_FAIL = { 
        id: 3, 
        type: 'LOGIN_2FA_FAIL', 
        displayName: 'Two-Factor Authentication Failed During Login', 
        alertLevel: 2,
        replaceActionTypes: []
    };

    static LOGIN_SUCCESS = { 
        id: 1, 
        type: 'LOGIN_SUCCESS', 
        displayName: 'User Successfully Logged In', 
        alertLevel: 0,
        replaceActionTypes: [AuditActionType.LOGIN_FAIL]
    };


    static PASSWORD_RECOVERY_WITH_EMAIL_STARTED = { 
        id: 4, 
        type: 'PASSWORD_RECOVERY_WITH_EMAIL_STARTED', 
        displayName: 'Password Recovery with Email Started', 
        alertLevel: 1,
        replaceActionTypes: []
    };

    static PASSWORD_RECOVERY_WITH_EMAIL_HARD_FAIL_AT_TOKEN = { 
        id: 5, 
        type: 'PASSWORD_RECOVERY_WITH_EMAIL_HARD_FAIL_AT_TOKEN', 
        displayName: 'Password Recovery Email Token Hard Fail', 
        alertLevel: 2,
        replaceActionTypes: [AuditActionType.PASSWORD_RECOVERY_WITH_EMAIL_STARTED]
    };

    static PASSWORD_RECOVERY_WITH_EMAIL_HARD_FAIL_AT_EMAIL = { 
        id: 6, 
        type: 'PASSWORD_RECOVERY_WITH_EMAIL_HARD_FAIL_AT_EMAIL', 
        displayName: 'Password Recovery Email Hard Fail', 
        alertLevel: 2,
        replaceActionTypes: [AuditActionType.PASSWORD_RECOVERY_WITH_EMAIL_STARTED]
    };

    static PASSWORD_RECOVERY_WITH_EMAIL_COMPLETE = { 
        id: 7, 
        type: 'PASSWORD_RECOVERY_WITH_EMAIL_COMPLETE', 
        displayName: 'Password Recovery with Email Complete', 
        alertLevel: 0,
        replaceActionTypes: [AuditActionType.PASSWORD_RECOVERY_WITH_EMAIL_STARTED,AuditActionType.PASSWORD_RECOVERY_WITH_EMAIL_HARD_FAIL_AT_TOKEN,AuditActionType.PASSWORD_RECOVERY_WITH_EMAIL_STARTED]
    };

    static PASSWORD_RECOVERY_WITH_TOKEN_STARTED = { 
        id: 8, 
        type: 'PASSWORD_RECOVERY_WITH_TOKEN_STARTED', 
        displayName: 'Password Recovery with Token Started', 
        alertLevel: 1,
        replaceActionTypes: []
    };

    static PASSWORD_RECOVERY_GRANTED_BY_ADMIN_STARTED = { 
        id: 9,
        type: 'PASSWORD_RECOVERY_GRANTED_BY_ADMIN_STARTED', 
        displayName: 'Password Recovery granted by an admin started', 
        alertLevel: 0,
        replaceActionTypes: []
    };

    static PASSWORD_RECOVERY_WITH_TOKEN_HARD_FAIL = { 
        id: 10, 
        type: 'PASSWORD_RECOVERY_WITH_TOKEN_HARD_FAIL', 
        displayName: 'Password Recovery Token Hard Fail', 
        alertLevel: 1,
        replaceActionTypes: [AuditActionType.PASSWORD_RECOVERY_WITH_TOKEN_STARTED]
    };

    static PASSWORD_RECOVERY_WITH_TOKEN_COMPLETE = { 
        id: 11,
        type: 'PASSWORD_RECOVERY_WITH_TOKEN_COMPLETE', 
        displayName: 'Password Recovery with Token Complete', 
        alertLevel: 0,
        replaceActionTypes: [AuditActionType.PASSWORD_RECOVERY_WITH_TOKEN_STARTED,AuditActionType.PASSWORD_RECOVERY_WITH_TOKEN_HARD_FAIL]
    };

    static PASSWORD_RECOVERY_GRANTED_BY_ADMIN_COMPLETE = { 
        id: 12,
        type: 'PASSWORD_RECOVERY_GRANTED_BY_ADMIN_COMPLETE', 
        displayName: 'Password Recovery granted by an admin Complete', 
        alertLevel: 0,
        replaceActionTypes: [AuditActionType.PASSWORD_RECOVERY_GRANTED_BY_ADMIN_STARTED]
    };

    static TWO_FACTOR_AUTH_ENABLED = { 
        id: 13,
        type: 'TWO_FACTOR_AUTH_ENABLED', 
        displayName: 'Two-Factor Authentication Enabled', 
        alertLevel: 0,
        replaceActionTypes: [AuditActionType.PASSWORD_RECOVERY_WITH_TOKEN_HARD_FAIL,AuditActionType.PASSWORD_RECOVERY_WITH_EMAIL_STARTED]
    };

    static TWO_FACTOR_AUTH_DISABLED = { 
        id: 14, 
        type: 'TWO_FACTOR_AUTH_DISABLED', 
        displayName: 'Two-Factor Authentication Disabled', 
        alertLevel: 1,
        replaceActionTypes: []
    };

    static PASSWORD_CHANGED = { 
        id: 15, 
        type: 'PASSWORD_CHANGED', 
        displayName: 'User Password Changed', 
        alertLevel: 1,
        replaceActionTypes: []
    };

    static PASSWORD_CHANGE_FAIL = { 
        id: 16, 
        type: 'PASSWORD_CHANGE_FAIL', 
        displayName: 'Password Change Attempt Blocked', 
        alertLevel: 2,
        replaceActionTypes: []
    };


    static RECOVERY_METHOD_UPDATE_FAIL = { 
        id: 17, 
        type: 'RECOVERY_METHOD_UPDATE_FAIL', 
        displayName: 'User Recovery Method Update Blocked', 
        alertLevel: 2,
        replaceActionTypes: []
    };

    static RECOVERY_METHOD_UPDATED = { 
        id: 18, 
        type: 'RECOVERY_METHOD_UPDATED', 
        displayName: 'User Recovery Method Updated', 
        alertLevel: 0,
        replaceActionTypes: []
    };



    /**
     * @description Get all defined action types as an array.
     * @returns {Array<Object>} - An array of all action type objects.
     */
    static all() {
        return [
            AuditActionType.REGISTER,
            AuditActionType.LOGIN_SUCCESS,
            AuditActionType.LOGIN_FAIL,
            AuditActionType.LOGIN_2FA_FAIL,
            AuditActionType.PASSWORD_RECOVERY_WITH_EMAIL_STARTED,
            AuditActionType.PASSWORD_RECOVERY_WITH_EMAIL_HARD_FAIL_AT_TOKEN,
            AuditActionType.PASSWORD_RECOVERY_WITH_EMAIL_HARD_FAIL_AT_EMAIL,
            AuditActionType.PASSWORD_RECOVERY_WITH_EMAIL_COMPLETE,
            AuditActionType.PASSWORD_RECOVERY_WITH_TOKEN_STARTED,
            AuditActionType.PASSWORD_RECOVERY_WITH_TOKEN_HARD_FAIL,
            AuditActionType.PASSWORD_RECOVERY_WITH_TOKEN_COMPLETE,
            AuditActionType.TWO_FACTOR_AUTH_ENABLED,
            AuditActionType.TWO_FACTOR_AUTH_DISABLED,
            AuditActionType.PASSWORD_CHANGED,
            AuditActionType.PASSWORD_CHANGE_FAIL,
            AuditActionType.RECOVERY_METHOD_UPDATE_FAIL,
            AuditActionType.RECOVERY_METHOD_UPDATED
        ];
    }

    /**
     * @description Retrieve a specific AuditActionType by its Id.
     * @param {number} actionTypeId - The ID of the action type.
     * @returns {AuditActionType} - The action type object.
     */
    static byId(actionTypeId) {
        return AuditActionType.all()[actionTypeId];
    }
}
