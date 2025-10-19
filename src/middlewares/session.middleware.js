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
import session from 'express-session';
import betterSqlite3SessionStore from 'better-sqlite3-session-store';

import { generateAsciiSecret } from '../helpers/generate-secrets.js';
import { initDatabase } from '../helpers/database.js';

import secretService from '../services/secret.service.js';
import env from '../helpers/env.js';
 
// Create a session store using better-sqlite3
const SqliteStore = betterSqlite3SessionStore(session);

// Initialize the database for session storage
const { db } = initDatabase("sessions", env.DATABASE_KEYS.SESSIONS);

/**
 * @description Middleware for managing user sessions in the application.
 * This middleware uses SQLite for session storage and configures various session options.
 * @type {import("express-session").SessionOptions}
 */
const shortSessionMiddleware = session({
    store: new SqliteStore({
        client: db,
        expired: {
            clear: true,
            intervalMs: 5 * 60 * 1000 // Clear expired sessions every 15 minutes
        }
    }),
    cookie: {
        secure: env.IS_SECURE_CONTEXT, // Use secure cookies in secure contexts
        httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
        maxAge: 10 * 60 * 1000, // Session timeout set to 10 minutes
        expires: 15 * 60 * 1000 // Session expire set to 15 minutes
    },
    cookieName: 'express-session', // Name of the session cookie
    secret: await secretService.getEntries("EXPRESS_SESSION_SECRET", () => generateAsciiSecret(40), { lifeTime: 120, graceTime: 2 }),
    resave: true, // Save session even if it was not modified
    saveUninitialized: true, // Save uninitialized sessions
    proxy: env.IS_BEHIND_PROXY // Trust the proxy if the app is behind one
});

export default shortSessionMiddleware
