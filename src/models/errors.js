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