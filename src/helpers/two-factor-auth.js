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
import speakeasy from "speakeasy";

export default {
    /**
     * @description Generates a secret usable for two-factor authentication (2FA).
     * @returns {String} The generated secret in base32 format.
     */
    generateSecret: () => {
        return speakeasy.generateSecret().base32;
    },

    /**
     * @description Generates a URL for two-factor authentication (2FA) using a provided secret.
     * @param {String} secret - The base32 secret used for generating the URL.
     * @param {String} issuer - The name of the issuer (e.g., application name).
     * @param {String} label - The label for the account (e.g., user name).
     * @returns {String} The generated OTP Auth URL.
     */
    generateUrl: (secret, issuer, label) => {
        return speakeasy.otpauthURL({
            secret: secret,
            encoding: "base32",
            issuer: issuer,
            label: label
        });
    },

    /**
     * @description Verifies a token against a secret at the current time.
     * @param {String} secret - The base32 secret used for verification.
     * @param {String} token - The token to verify.
     * @returns {Boolean} True if the token is valid, otherwise false.
     */
    verify: (secret, token) => {
        return speakeasy.totp.verify({
            secret: secret,
            token: token,
            encoding: 'base32',
            window: 2 // Allows for a time window of 2 steps for verification
        });
    }
};
