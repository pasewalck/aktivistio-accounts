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
 * Copyright (C) 2025 Jana Caroline Pasewalck
 */
/**
 * @typedef {import("express").Request} Request
 */

/**
 * @typedef {import("express").Response} Response
 */

export default {
    /**
     * @description Renders the consent page for login authorization.
     * Displays the consent form to the user, allowing them to authorize the requested action.
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     * @param {string} uid - The unique identifier for the interaction session.
     * @param {string} clientId - The ID of the client requesting authorization.
     */
    consent: (req, res, uid, clientId) => {
        return res.render('pages/oidc/consent', {
            title: res.__('page.title.authorize'),
            clientId,
            urls: {
                action: `/interaction/${uid}/confirm/`,
                abort: `/interaction/${uid}/abort/`
            }
        });
    },
};
