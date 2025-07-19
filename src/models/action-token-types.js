/**
 * Enum for account action token types.
 * @readonly
 * @enum {string}
 */
export class ActionTokenTypes {
    static ACCOUNT_SETUP = "account_setup";
    static ACCOUNT_REGISTER = "account_register";
    static LOGIN_SECOND_FACTOR = "login_2fa";
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
