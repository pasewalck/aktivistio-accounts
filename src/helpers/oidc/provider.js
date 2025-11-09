/* 
 * This file is part of "Aktivistio Accounts".
 *
 * The project "Aktivistio Accounts" implements an account system and 
 * management platform combined with an OAuth 2.0 Authorization Server.
 *
 * "Aktivistio Accounts" is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * "Aktivistio Accounts" is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with "Aktivistio Accounts". If not, see https://www.gnu.org/licenses/.
 *
 * Copyright (C) 2025 Jana Caroline Pasewalck
 */
import Adapter from '../../models/oidc-adapter.js';
import findAccount from './find-account.js';
import Provider from 'oidc-provider';
import configuration from './configuration.js';
import logger from '../logger.js';
import env from '../env.js';
import { extendUrl } from '../url.js';

// Log the initialization of the OIDC provider
logger.debug("Initializing OIDC provider");

// Create a new instance of the OIDC provider
const provider = new Provider(extendUrl(env.BASE_URL,`oidc`).href, {
    adapter: Adapter,
    clients: [],
    findAccount: findAccount,
    ...configuration
});

// Set the proxy configuration if the application is behind a proxy
provider.proxy = env.IS_BEHIND_PROXY;

// Export the configured OIDC provider instance
export default provider;
