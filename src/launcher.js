import { createLauncher } from "init-secret-launcher";
import { Secret } from "init-secret-launcher/secret.js";
import { generateAlphanumericSecret } from "./helpers/generate-secrets.js";
import spawn from "cross-spawn";
import logger from "./helpers/logger.js";

createLauncher([
    new Secret("DATABASE_KEY_DATA",() => generateAlphanumericSecret(40)),
    new Secret("DATABASE_KEY_OIDC",() => generateAlphanumericSecret(40)),
    new Secret("DATABASE_KEY_SECRETS",() => generateAlphanumericSecret(40)),
    new Secret("DATABASE_KEY_SESSIONS",() => generateAlphanumericSecret(40))
],"data/database-secrets.txt",process.env.LAUNCHER_PORT | 3000,() => {
    const password = generateAlphanumericSecret(40)
    logger.info(`Launcher initiated with new password: ${password}`)
    return password;
},(secrets) => {
    logger.info("Launcher unlocked and starting main service ...")
    const child = spawn('node', ['src/server.js'], {
        env: {
            ...process.env,
            ...secrets
        },
        stdio: 'inherit'
    });
})