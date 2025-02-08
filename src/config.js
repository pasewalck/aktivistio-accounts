import fs from 'fs';
import jose from 'node-jose';
import { generateSecret } from './helpers/generate-secrets.js';
import logger from './logger.js';

let json = fs.existsSync("config.json") ? JSON.parse(fs.readFileSync("config.json")) : {}

logger.debug("Loaded configuration file to memory")

/**
 * @description load a variable from config. If non is found a default will be generated and inserted
 * @param {String} path 
 * @param {CallableFunction} generateFunction 
 * @returns JSON
 */
async function loadWithGenerator(path,generateFunction) {
    if(!json[path])
        json[path] = await generateFunction()
    return json[path]
}
/**
 * @description load a variable from config.
 * @param {String} path 
 * @param {JSON} fallback 
 * @param {Boolean} warn 
 * @returns 
 */
function load(path,fallback,warn) {
    if(!json[path])
    {
        if(warn)
            logger.warn(`Missing configuration variable "${path}"`)
        return fallback
    } else
        return json[path]

}

export default {
    applicationName:load("app_name"),
    baseUrl:load("base_url","http://localhost:3000"),
    port:load("port",3000),
    isSecureContext:load("is_secure",false),
    isBehindProxy:load("is_behind_proxy",false),
    expressSessionSecret:await loadWithGenerator("express_session_secret",() => generateSecret()),
    cookieParserSecret:await loadWithGenerator("cookie_parser_secret",() => generateSecret()),
    csrfSecret:await loadWithGenerator("csrf_secret",() => generateSecret()),
    fingerprintSalt:await loadWithGenerator("fingerprint_salt",() => generateSecret()),
    invitingMailProviders:load("inviting_mail_providers",{},true),
    databaseKey:await loadWithGenerator("database_key",() => generateSecret()),
    mail:load("mail",{},true),
    clients:load("clients",{},true),
    inviteCodes:{
        newUsers:{
            count: load("new_user_invite_count",3),
            waitDays: load("new_user_invite_wait",14),
        },
        regenerating:{
            maxCount: load("regenerating_user_invite_count",3),
        }
    },
    jwks:await loadWithGenerator("jwks",async () => {
        const keyStore = jose.JWK.createKeyStore();
        const result = await keyStore.generate("RSA", 2048, { alg: "RS256", use: "sig" })
        return keyStore.toJSON(true);
    }),
}

fs.writeFileSync("config.json",JSON.stringify(json, null, "  "));


