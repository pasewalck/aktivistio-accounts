import express from 'express'
import path from 'path'
import expressLayouts from 'express-ejs-layouts'
import cookieParser from 'cookie-parser';
import i18n from 'i18n';

import { fileURLToPath } from 'url';
import { generateSecret } from './helpers/generate-secrets.js';

import csrfProtection from './middlewares/csrf-protection.middleware.js';
import dashboardRoutes from './routes/dashboard.router.js';
import oidcRoutes from './routes/oidc.router.js';
import loggedOutDashboardRouter from './routes/logged-out.dashboard.router.js';
import ipTokenizationMiddleware from './middlewares/ipTokenization.middleware.js';
import shortSessionMiddleware from './middlewares/session.middleware.js';
import provider from './helpers/oidc/provider.js';
import langController from './controllers/lang.controller.js';
import errorsMiddleware from './middlewares/errors.middleware.js';
import logger from './helpers/logger.js';
import secretService from './services/secret.service.js';
import env from './helpers/env.js';
import { assembleUrl, extendUrl } from './helpers/url.js';

// Get the current file and directory names
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

logger.debug("Initializing express");

const app = express();

// Set application locals for use in views
app.locals = {
    baseUrl: env.BASE_URL,
    urlUtils: {
        assembleUrl,
        extendUrl
    },
    app: {
        name: env.APPLICATION_NAME,
        logo: env.APPLICATION_LOGO
    },
};

logger.debug("Initializing i18n for internationalization");

i18n.configure({
    locales: ['en', 'de'],
    directory: 'locales',
    defaultLocale: 'de',
    cookie: 'i18n',
});

// Serve static files from the public directory
logger.debug("Setting public express route");
app.use(express.static('src/public'));

// Session, cookie parsing and ip tokenization middleware
app.use(ipTokenizationMiddleware)
app.use(shortSessionMiddleware);
app.use(cookieParser(await secretService.getEntries("COOKIE_PARSER_SECRET", () => generateSecret(40), { lifeTime: 365, graceTime: 30 })));
app.use(express.urlencoded({ extended: true }));

// Initialize i18n middleware
app.use(i18n.init);

logger.debug("Initializing express views and layouts");

// Set up view engine and layout
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('layout', './layouts/main');

logger.debug("Initializing middlewares");

// CSRF protection middleware
app.use(csrfProtection);

// Attach OIDC callback
logger.debug("Attaching OIDC callback");
app.use("/oidc", await provider.callback());

logger.debug("Initializing routers");

// Bind routes to the application
oidcRoutes(app);
dashboardRoutes(app);
loggedOutDashboardRouter(app);

// Attach language change controller
logger.debug("Attaching language controller");
app.get('/change-language', langController.changeLanguage);

// Attach error handling middleware
logger.debug("Attaching errors middleware");
app.use(errorsMiddleware);

// Start the server and listen on the specified port
logger.debug(`Starting and trying to listen on PORT ${env.PORT}`);
app.listen(env.PORT, function () {
    logger.info(`Started on PORT ${env.PORT}`);
});
