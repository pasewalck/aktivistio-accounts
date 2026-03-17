import { describe, it, expect, vi, beforeEach } from 'vitest';
import app from '../../src/app.js';
import * as cheerio from 'cheerio';
import env from '../../src/helpers/env.js';
import { requestWithFormData } from '../../src/helpers/requestWithFormData.js';
import accountService from '../../src/services/account.service.js';

import twoFactorAuth from '../../src/helpers/two-factor-auth.js';
import request from 'supertest';
import sharedRenderer from '../../src/renderers/shared.renderer.js';

vi.mock('../../src/middlewares/csrf-protection.middleware.js', () => ({
	default: (req, res, next) => {
		res.locals = res.locals || {};
		res.locals.csrfToken = 'test-csrf-token';
		return next();
	},
}));

describe('Login with 2fa', () => {
	let agent, secret, twoFactorToken;

	beforeEach(async () => {
		agent = request.agent(app);

		const account = accountService.find.withUsername('admin');
		secret = twoFactorAuth.generateSecret();
		accountService.twoFactorAuth.set(account, secret);

		let res = await requestWithFormData(agent, '/login', {
			username: 'admin',
			password: env.DEFAULT.SUPERADMIN_PASSWORD,
		});
		expect(res.status).toBe(200);

		let $ = cheerio.load(res.text);
		twoFactorToken = $('input[name="twoFactorLoginToken"]').val();

		expect(twoFactorToken).toBeDefined();
	});

	it('should login successfully with valid 2fa token if 2fa is enabled', async () => {
		const res = await requestWithFormData(agent, '/login/2fa', {
			twoFactorLoginToken: twoFactorToken,
			token: twoFactorAuth.generateToken(secret),
		});

		expect(res.status).toBe(302);
		expect(res.headers.location).toBe('http://localhost:3000/');
	});

	it('should not login successfully with invalid 2fa token', async () => {
		const spy = vi.spyOn(sharedRenderer, 'twoFactorAuth');
		const res = await requestWithFormData(agent, '/login/2fa', {
			twoFactorLoginToken: twoFactorToken,
			token: '00000',
		});
		expect(res.status).toBe(200);
		expect(spy).toHaveBeenCalledWith(
			expect.any(Object),
			undefined,
			expect.any(String),
			expect.objectContaining({
				token: expect.any(Object),
			})
		);
	});
});
