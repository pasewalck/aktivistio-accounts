/**
 * @description Alphanumeric characters
 */
export const Alphanumeric = {
    Uppers: "QWERTYUIOPASDFGHJKLZXCVBNM",
    Lowers: "qwertyuiopasdfghjklzxcvbnm",
    Numbers: "1234567890",
};
/**
 * @description Alphanumeric characters: Some letters look similarto numbers or other letters. Such as "l" and "I". These letters and numbers are removed to avoid confusion on the user side.
 */
export const AlphanumericCleaned = {
    Uppers: "QWERTYUPASDFGHJKLZXCVBNM",
    Lowers: "qwertyuipasdfghjkzxcvbnm",
    Numbers: "23456789",
};
