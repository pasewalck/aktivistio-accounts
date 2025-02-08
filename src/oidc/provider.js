import Adapter from './adapter.js';
import findAccount from './find-account.js';
import Provider from 'oidc-provider'
import configuration from './configuration.js';
import config from '../config.js';
import logger from '../logger.js';

logger.debug("Initializing oidc provider")

const provider = new Provider(`${config.baseUrl}/oidc`, {  adapter: Adapter, clients: config.clients, findAccount: findAccount,...configuration});
provider.proxy = config.isBehindProxy

export default provider