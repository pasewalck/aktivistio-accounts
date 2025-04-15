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
 * Represents a brute force block error.
 * @extends ClientError
 */
export class BruteForceBlockError extends ClientError {
    /**
     * Creates an instance of BruteForceBlockError.
     * @param {number} blockUntil - The time in seconds for blocking
     */
    constructor(blockUntil) {
        const currentTime = Math.floor(Date.now() / 1000);
        super(`Client is blocked for ${Math.floor(blockUntil-currentTime)} seconds`);
        this.blockUntil = blockUntil;
    }
}