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
 * Copyright (C) 2025 Jana
 */
/**
 * @typedef {import("express").Request} Request
 * Represents an HTTP request in Express.
 */

/**
 * @typedef {import("express").Response} Response
 * Represents an HTTP response in Express.
 */

export default {
    /**
     * @description Controller for changing the application's language.
     * This function sets a cookie with the selected language and redirects the user
     * back to the referring page or to the home page if no referrer is available.
     * @param {Request} req - The HTTP request object, which contains the query parameters.
     * @param {Response} res - The HTTP response object, used to set cookies and redirect.
     * @returns {void} This function does not return a value; it sends a response directly.
     */
    changeLanguage: (req, res) => {
        // Extract the language code from the query parameters
        const { lng } = req.query;

        // Set a cookie named 'i18n' with the selected language code
        res.cookie('i18n', lng);

        // Get the referring URL or default to the home page
        const redirectPath = req.get('Referrer') || '/';

        // Redirect the user to the referring page or home page
        res.redirect(redirectPath);
    }
}
