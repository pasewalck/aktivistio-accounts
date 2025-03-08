import logger from './logger.js';

logger.info("Loaded environment variables to memory");

/**
 * @description Load a variable from the environment configuration.
 * @param {String} name - The name of the environment variable to load.
 * @param {{default: *, warning: Boolean, parse: Function}} options - Options for loading the variable.
 * @param {any} options.default - The default value to return if the variable is not set.
 * @param {Boolean} options.warning - Whether to log a warning if the variable is missing.
 * @param {Function} options.parse - Optional function for parsing the value of the variable.
 * @returns {*} The value of the environment variable, the parsed value, or the default value.
 */
function load(name, options = {}) {
    const rawValue = process.env[name];

    // Check if the environment variable is defined
    if (rawValue === undefined) {
        if (options.warning) {
            logger.warn(`Missing environment variable "${name}"`);
        }
        return options.default; // Return the default value if the variable is not set
    } else {
        // If a parse function is provided, attempt to parse the raw value
        if (options.parse) {
            try {
                return options.parse(rawValue); // parse the raw value and return value
            } catch (error) {
                logger.error(`Error parsing environment variable "${name}": ${error.message}`);
                return options.default; // Return the default value on parse error
            }
        } else {
            return rawValue; // Return the raw value if no parsing is needed
        }
    }
}

// Exporting configuration settings loaded from environment variables
export default {
    APPLICATION_NAME: load("APP_NAME", { default: "Unnamed Application" }),
    APPLICATION_LOGO: `configuration/${load("APP_LOGO", { default: "app-logo.jpeg" })}`,
    BASE_URL: load("BASE_URL", { default: "http://localhost:3000" }),
    PORT: load("PORT", { default: 3000, parse: Number }),
    IS_SECURE_CONTEXT: load("IS_SECURE", { default: false, parse: Boolean }),
    IS_BEHIND_PROXY: load("IS_BEHIND_PROXY", { default: false, parse: Boolean }),
    WHITELISTED_MAIL_PROVIDERS: load("WHITELISTED_MAIL_PROVIDERS", { 
        default: [], 
        warning: true, 
        parse: (value) => value.split(",") // Parse comma-separated values
    }),
    DATABASE_KEYS: {
        DATA: load("DATABASE_KEY_DATA", { warning: true }),
        OIDC: load("DATABASE_KEY_OIDC", { warning: true }),
        SECRETS: load("DATABASE_KEY_SECRETS", { warning: true }),
        SESSIONS: load("DATABASE_KEY_SESSIONS", { warning: true }),
    },
    MAIL: {
        HOST: load("MAIL_HOST", { warning: true }),
        USER: load("MAIL_USER", { warning: true }),
        PASS: load("MAIL_PASS", { warning: true }),
        SECURE: load("MAIL_SECURE", { default: true, parse: Boolean }),
        PORT: load("MAIL_PORT", { default: 465, parse: Number }),
        SENDER_DISPLAY_NAME: load("MAIL_SENDER_DISPLAY_NAME", { 
            default: "Unnamed Application", 
            warning: true 
        }),
    },
};