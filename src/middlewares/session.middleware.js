import session from 'express-session';
import betterSqlite3SessionStore from 'better-sqlite3-session-store';

import { generateSecret } from '../helpers/generate-secrets.js';
import secretService from '../services/secret.service.js';
import { initDatabase } from '../helpers/database.js';
import env from '../helpers/env.js';
 
const SqliteStore = betterSqlite3SessionStore(session)

const {db} = initDatabase("sessions",env.DATABASE_KEYS.SESSIONS)

const sessionMiddleware = session({
    store: new SqliteStore({
      client: db, 
      expired: {
        clear: true,
        intervalMs: 15 * 60 * 1000 //ms = 15min
      }
    }),
    cookie: {   
      secure: env.IS_SECURE_CONTEXT,
      httpOnly: true, 
      maxAge: 4*60*1000, // four minute timeout
    },
    cookieName: 'express-session',
    secret: await secretService.getEntries("EXPRESS_SESSION_SECRET",() => generateSecret(40),{lifeTime:120,graceTime:2}),
    resave: true,
    saveUninitialized: true,
    proxy: env.IS_BEHIND_PROXY,
  })

export default sessionMiddleware