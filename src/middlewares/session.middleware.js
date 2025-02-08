import session from 'express-session';
import betterSqlite3SessionStore from 'better-sqlite3-session-store';

import dbDriver from '../drivers/db.driver.js';
import config from '../config.js';
 
const SqliteStore = betterSqlite3SessionStore(session)


const sessionMiddleware = session({
    store: new SqliteStore({
      client: dbDriver.db, 
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
    secret: config.expressSessionSecret,
    resave: true,
    saveUninitialized: true,
    proxy: config.isBehindProxy,
  })

export default sessionMiddleware