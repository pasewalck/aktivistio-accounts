import Adapter from '../models/oidc-adapter.js';
import findAccount from './find-account.js';
import Provider from 'oidc-provider';
import configuration from './configuration.js';
import logger from '../helpers/logger.js';
import env from '../helpers/env.js';

// Log the initialization of the OIDC provider
logger.debug("Initializing OIDC provider");

// Create a new instance of the OIDC provider
const provider = new Provider(`${env.BASE_URL}/oidc`, {
    adapter: Adapter,
    clients: [],
    findAccount: findAccount,
    ...configuration
});

// Set the proxy configuration if the application is behind a proxy
provider.proxy = env.IS_BEHIND_PROXY;

// Export the configured OIDC provider instance
export default provider;