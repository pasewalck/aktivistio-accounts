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
 * along with "Aktivistio Accounts". If not, see <https://www.gnu.org/licenses/>.
 *
 * Copyright (C) 2025 Jana
 */

import { createLauncher } from "init-secret-launcher";
import { Secret } from "init-secret-launcher/secret.js";
import { generateAlphanumericSecret } from "./helpers/generate-secrets.js";
import spawn from "cross-spawn";
import logger from "./helpers/logger.js";
import { extendUrl } from "./helpers/url.js";

console.log(process.env.BASE_URL != undefined ? process.env.BASE_URL : "")

createLauncher([
    new Secret("DATABASE_KEY_DATA",() => generateAlphanumericSecret(40)),
    new Secret("DATABASE_KEY_OIDC",() => generateAlphanumericSecret(40)),
    new Secret("DATABASE_KEY_SECRETS",() => generateAlphanumericSecret(40)),
    new Secret("DATABASE_KEY_SESSIONS",() => generateAlphanumericSecret(40))
],"data/database-secrets.txt",process.env.LAUNCHER_PORT | 3000,() => {
    const password = generateAlphanumericSecret(40)
    logger.info(`Launcher initiated with new password: ${password}`)
    return password;
}
,(secrets) => {
    logger.info("Starting main service ...")
    const child = spawn('node', ['src/server.js'], {
        env: {
            ...process.env,
            ...secrets
        },
        stdio: 'inherit'
    });
},
(secrets) => {

},
(isError,...message) => {
    if(isError)
        logger.error(message.join(" "))
    else
        logger.info(message.join(" "))
},
extendUrl(new URL(process.env.BASE_URL != undefined ? process.env.BASE_URL : "http://localhost:3000"),"health").href
)