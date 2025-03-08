/**
 * @description A collection of alphanumeric characters categorized into uppercase letters, lowercase letters, and digits.
 */
export const Alphanumeric = {
    /** Uppercase letters from A to Z */
    Uppers: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    /** Lowercase letters from a to z */
    Lowers: "abcdefghijklmnopqrstuvwxyz",
    /** Digits from 0 to 9 */
    Numbers: "0123456789",
};

/**
 * @description A collection of alphanumeric characters with potential confusions removed.
 * This collection excludes characters that can be easily mistaken for others.
 * Removed character pairs looking similar:
 * - Uppercase 'I', Lowercase 'l', Lowercase 'i' and number '1'
 * - Uppercase 'O' Lowercase 'o' and number '0'
 */
export const AlphanumericMoreReadable = {
    /** Uppercase letters excluding 'O' and 'I' */
    Uppers: "ABCDEFGHJKLMNPQRSTUVWXYZ",
    /** Lowercase letters excluding 'o', 'l' and 'i' */
    Lowers: "abcdefghjkmnpqrstuvwxyz",
    /** Digits excluding '0' and '1' */
    Numbers: "23456789",
};