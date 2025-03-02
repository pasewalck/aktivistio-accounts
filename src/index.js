import express from 'express'
import path from 'path'
import expressLayouts from 'express-ejs-layouts'
import cookieParser from 'cookie-parser';
import i18n from 'i18n';

import { fileURLToPath } from 'url';

import csrfProtection from './middlewares/csrf-protection.middleware.js';
import dashboardRoutes from './routes/dashboard.router.js';
import oidcRoutes from './routes/oidc.router.js';
import loggedOutDashboardRouter from './routes/logged-out.dashboard.router.js';
import sessionMiddleware from './middlewares/session.middleware.js';
import provider from './oidc/provider.js';
import langController from './controllers/lang.controller.js';
import errorsMiddleware from './middlewares/errors.middleware.js';
import config from './config.js';
import logger from './logger.js';
import { generateSecret } from './helpers/generate-secrets.js';
import secretService from './services/secret.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

logger.debug("Initializing express")

const app = express();

app.locals = {
    baseUrl:config.baseUrl,
    app: {
        name: config.applicationName,
        logo: config.applicationLogo
    },
};

logger.debug("Initializing i18n")

i18n.configure({
    locales:['en', 'de'],
    directory: 'locales',
    defaultLocale: 'de',
    cookie: 'i18n',
});

logger.debug("Setting public express route")

app.use(express.static('src/public'))

logger.debug("Initializing middlewares")

app.use(sessionMiddleware)
app.use(cookieParser(await secretService.getEntries("COOKIE_PARSER_SECRET",() => generateSecret(40),{lifeTime:365,graceTime:30})))
app.use(express.urlencoded({ extended: true }));

app.use(csrfProtection)

app.use(i18n.init);

logger.debug("Initializing express views and layouts")

app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('layout', './layouts/main');

logger.debug("Attaching oidc callback")

app.use("/oidc",await provider.callback());

logger.debug("Initializing routers")

oidcRoutes(app);
dashboardRoutes(app);
loggedOutDashboardRouter(app);

logger.debug("Attaching language controller")

app.get('/change-language', langController.changeLanguage);

logger.debug("Attaching errors middleware")

app.use(errorsMiddleware)

logger.debug(`Starting and trying to listen on PORT ${config.port}`)

app.listen(config.port, function () {
    logger.info(`Started on PORT ${config.port}`)
});

