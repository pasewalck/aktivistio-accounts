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
 * Enum for account action token types.
 * @readonly
 * @enum {string}
 */
export class ActionTokenTypes {
    static ACCOUNT_SETUP = "account_setup";
    static ACCOUNT_REGISTER = "account_register";
    static LOGIN_SECOND_FACTOR = "page.login_2fa";
    static PASSWORD_RESET = "password_reset";
}

/**
 * Enum for password reset channels/methods
 * @readonly
 * @enum {string}
 */
export class PasswordResetChannels {
    static EMAIL = "reset_channel_email";
    static RECOVERY_TOKEN = "reset_channel_recovery_token";
    static ADMIN = "reset_channel_admin";
}
