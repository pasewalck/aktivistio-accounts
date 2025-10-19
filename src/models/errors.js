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
 * Represents an internal server error.
 * @extends Error
 */
export class InternalError extends Error {
    /**
     * Creates an instance of InternalError.
     * @param {string} message - The error message.
     */
    constructor(message) {
        super(message);
        this.name = "InternalError";
        this.statusCode = 500; // Internal Server Error
    }
}

/**
 * Represents a client error.
 * @extends Error
 */
export class ClientError extends Error {
    /**
     * Creates an instance of ClientError.
     * @param {string} message - The error message.
     */
    constructor(message) {
        super(message);
        this.name = "ClientError";
        this.statusCode = 400; // Bad Request
    }
}

/**
 * Represents an unexpected client error.
 * @extends ClientError
 */
export class UnexpectedClientError extends ClientError {
    /**
     * Creates an instance of UnexpectedClientError.
     * @param {string} message - The error message.
     */
    constructor(message) {
        super(message);
        this.name = "UnexpectedClientError";
    }
}
