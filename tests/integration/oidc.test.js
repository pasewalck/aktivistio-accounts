import { describe, it, expect, vi } from 'vitest';
import app from '../../src/app.js';
import request from 'supertest';
import adapterService from '../../src/services/adapter.service.js';
import env from '../../src/helpers/env.js';
import { requestWithFormData } from '../../src/helpers/requestWithFormData.js';
import * as cheerio from 'cheerio';

vi.mock('../../src/middlewares/csrf-protection.middleware.js', () => ({
	default: (req, res, next) => {
		res.locals = res.locals || {};
		res.locals.csrfToken = 'test-csrf-token';
		return next();
	},
}));

const extractTokenFromUrl = (url) => url.split('/').pop();

const OIDC_PATHS = {
	configuration: '/oidc/.well-known/openid-configuration',
	token: '/oidc/token',
};

const TEST_CLIENT = {
	id: 'kbyuFDidLLm280LIwVFiazOqjO3ty8KH',
	secret: '60Op4HFM0I8ajz0WdiStAbziZ-VFQttXuxixHHs2R7r7-CW8GR79l-mmLqMhc-Sa',
	redirectUri: 'https://wiki.aktivismus.org',
	state: 'm2wxepb30la',
};

const createTestClient = (clientId, clientSecret, redirectUrl) => ({
	client_name: 'Example Name',
	client_id: clientId,
	client_uri: redirectUrl,
	client_secret: clientSecret,
	grant_types: ['authorization_code'],
	redirect_uris: [redirectUrl],
	post_logout_redirect_uris: [redirectUrl],
	response_types: ['code'],
});

const createAuthParams = (clientId, redirectUrl, state) => ({
	client_id: clientId,
	redirect_uri: redirectUrl,
	scope: 'openid',
	response_type: 'code',
	state,
});

const createAuthorizationUrl = ({ clientId, redirectUri, state }) =>
	`/oidc/auth?${new URLSearchParams(createAuthParams(clientId, redirectUri, state)).toString()}`;

const expectAuthorizationResponseParams = (searchParams) => {
	expect(searchParams.has('state')).toBe(true);
	expect(searchParams.has('iss')).toBe(true);
	expect(searchParams.has('code')).toBe(true);
};

describe('Open ID Connect', () => {
	it('should provide configuration', async () => {
		const agent = request.agent(app);
		const res = await agent.get(OIDC_PATHS.configuration);

		expect(res.status).toBe(200);
		expect(res.body).toHaveProperty('authorization_endpoint');
	});

	it('should allow login and logout in via auth endpoint', async () => {
		const agent = request.agent(app);
		const client = {
			clientId: TEST_CLIENT.id,
			clientSecret: TEST_CLIENT.secret,
			redirectUri: TEST_CLIENT.redirectUri,
			state: TEST_CLIENT.state,
		};

		adapterService.setEntry(
			'Client',
			client.clientId,
			createTestClient(client.clientId, client.clientSecret, client.redirectUri)
		);

		try {
			const authUrl = createAuthorizationUrl(client);
			let res = await agent.get(authUrl);
			expect(res.status).toBe(303);

			res = await requestWithFormData(agent, `${res.headers.location}/login`, {
				username: 'admin',
				password: env.DEFAULT.SUPERADMIN_PASSWORD,
			});
			expect(res.status).toBe(303);

			const consentToken = extractTokenFromUrl(res.headers.location);
			res = await agent.get(`/oidc/auth/${consentToken}`);
			expect(res.status).toBe(303);

			res = await agent.post(`${res.headers.location}/confirm`);
			expect(res.status).toBe(303);

			const finalToken = extractTokenFromUrl(res.headers.location);
			res = await agent.get(`/oidc/auth/${finalToken}`);
			expect(res.status).toBe(303);

			const redirectLocation = new URL(res.headers.location);
			expect(redirectLocation.origin).toBe(client.redirectUri);
			expectAuthorizationResponseParams(redirectLocation.searchParams);

			res = await requestWithFormData(agent, OIDC_PATHS.token, {
				grant_type: 'authorization_code',
				client_id: client.clientId,
				client_secret: client.clientSecret,
				redirect_uri: client.redirectUri,
				code: redirectLocation.searchParams.get('code'),
			});

			expect(res.status).toBe(200);
			expect(res.body).toHaveProperty('access_token');
			expect(res.body).toHaveProperty('id_token');

			const idToken = res.body.id_token;

			res = await agent.get(
				`/oidc/session/end?id_token_hint=${idToken}&post_logout_redirect_uri=${TEST_CLIENT.redirectUri}`
			);
			expect(res.status).toBe(200);
			let $ = cheerio.load(res.text);
			const xsrf = $('input[name="xsrf"]').val();

			res = await requestWithFormData(agent, `/oidc/session/end/confirm`, {
				xsrf: xsrf,
				logout: 'yes',
			});

			expect(res.status).toBe(303);
			const logoutRedirectLocation = new URL(res.headers.location);
			expect(logoutRedirectLocation.origin).toBe(TEST_CLIENT.redirectUri);
		} finally {
			adapterService.removeEntry('Client', client.clientId);
		}
	});
});
