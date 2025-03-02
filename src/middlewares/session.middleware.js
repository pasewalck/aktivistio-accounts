import session from 'express-session';
import betterSqlite3SessionStore from 'better-sqlite3-session-store';

import config from '../config.js';
import { generateSecret } from '../helpers/generate-secrets.js';
import secretService from '../services/secret.service.js';
import { initDatabase } from '../helpers/database.js';
 
const SqliteStore = betterSqlite3SessionStore(session)

const {db} = initDatabase("sessions",process.env.SESSIONS_DATABASE_KEY)

const sessionMiddleware = session({
    store: new SqliteStore({
      client: db, 
      expired: {
        clear: true,
        intervalMs: 15 * 60 * 1000 //ms = 15min
      }
    }),
    cookie: {   
      secure: config.isSecureContext,
      httpOnly: true, 
      maxAge: 4*60*1000, // four minute timeout
    },
    cookieName: 'express-session',
    secret: await secretService.getEntries("EXPRESS_SESSION_SECRET",() => generateSecret(40),{lifeTime:120,graceTime:2}),
    resave: true,
    saveUninitialized: true,
    proxy: config.isBehindProxy,
  })

export default sessionMiddleware