import Adapter from '../models/oidc-adapter.js';
import findAccount from './find-account.js';
import Provider from 'oidc-provider'
import configuration from './configuration.js';
import logger from '../helpers/logger.js';
import env from '../helpers/env.js';

logger.debug("Initializing oidc provider")

const provider = new Provider(`${env.BASE_URL}/oidc`, {  adapter: Adapter, clients: [], findAccount: findAccount,...configuration});
provider.proxy = env.IS_BEHIND_PROXY

export default provider