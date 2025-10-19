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
