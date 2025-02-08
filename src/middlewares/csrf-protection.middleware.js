import { doubleCsrf } from 'csrf-csrf';
import config from '../config.js';

const {doubleCsrfProtection} = doubleCsrf(
  {
    getSecret: () => config.csrfSecret, 
    getSessionIdentifier: (req) => "",
    cookieName: "__Host-psifi.x-csrf-token",
    cookieOptions: {
      sameSite: "strict",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000
    },
    size: 64,
    ignoredMethods: ["GET", "HEAD", "OPTIONS"], 
    getTokenFromRequest: (req) => req.body?._csrf,
    errorConfig: {
      statusCode: 403,
      message: "Invalid csrf token.",
      code: "EBADCSRFTOKEN"
    }
  }
);

const csrfProtection = (req, res, next) => {
  doubleCsrfProtection(req,res,() => {
    res.locals.csrfToken = req.csrfToken()
    next();
  })

}

export default csrfProtection 