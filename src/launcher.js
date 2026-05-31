import { createLauncher, Var } from 'encrypted-secret-launcher';
import { generateAlphanumericSecret } from './helpers/generate-secrets.js';
import spawn from 'cross-spawn';
import logger from './helpers/logger.js';
import { extendUrl } from './helpers/url.js';

logger.info(process.env.BASE_URL != undefined ? process.env.BASE_URL : '');
let child;
let secrets;
let restarts = 0;
let restart = true;

function scheduleRestart() {
	if (!restart) return;
	restarts += 1;
	const delay = 1000 * Math.min(2 ** restarts, 16);
	logger.info(`Restarting main service in ${delay} ms (attempt ${restarts})`);
	setTimeout(startChild, delay);
}

function startChild() {
	logger.info('Starting main service ...');
	child = spawn('node', ['src/server.js'], {
		env: {
			...process.env,
			...secrets,
		},
		stdio: 'inherit',
	});

	logger.debug(`Started main service as child with pid=${child.pid}`);

	child.on('exit', (code, signal) => {
		logger.warn(`Main service exited pid=${child?.pid} code=${code} signal=${signal}`);
		scheduleRestart();
	});

	child.on('error', (err) => {
		logger.error('Failed to start main service as child:', err);
		scheduleRestart();
	});
}

const { runLauncherServer } = createLauncher(
	[
		new Var('DATABASE_KEY_DATA', () => generateAlphanumericSecret(40)),
		new Var('DATABASE_KEY_OIDC', () => generateAlphanumericSecret(40)),
		new Var('DATABASE_KEY_SECRETS', () => generateAlphanumericSecret(40)),
		new Var('DATABASE_KEY_SESSIONS', () => generateAlphanumericSecret(40)),
	],
	{
		filepath: 'data/database-secrets.json',
		legacyFilepath: 'data/database-secrets.txt',
		port: process.env.LAUNCHER_PORT | 3000,
		generatePasswort: () => {
			const password = generateAlphanumericSecret(40);
			logger.info(`Launcher initiated with new password: ${password}`);
			return password;
		},
		onComplete: (overwriteSecrets) => {
			secrets = overwriteSecrets;
			startChild();
		},
		onMessage: (isError, ...message) => {
			if (isError) logger.error(message.join(' '));
			else logger.info(message.join(' '));
		},
		healthCheckUrl: extendUrl(
			new URL(process.env.BASE_URL != undefined ? process.env.BASE_URL : 'http://localhost:3000'),
			'health'
		).href,
	}
);

runLauncherServer();

['SIGINT', 'SIGTERM', 'SIGHUP'].forEach((sig) =>
	process.on(sig, () => {
		if (child && child.pid) {
			logger.info('Stopping main process ...');
			restart = false;
			try {
				process.kill(child.pid, sig);
			} catch {
				logger.error('Failed to kill main process.');
			}
		}
		process.exit();
	})
);
