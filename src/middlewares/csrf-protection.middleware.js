import { doubleCsrf } from 'csrf-csrf';
import secretService from '../services/secret.service.js';
import { generateSecret } from '../helpers/generate-secrets.js';

const secret = await secretService.getEntries("CSRF_SECRET",() => generateSecret(40),{lifeTime:120,graceTime:2})

const {doubleCsrfProtection} = doubleCsrf(
  {
    getSecret: () => secret, 
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