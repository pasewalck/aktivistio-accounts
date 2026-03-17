import { describe, it, expect, vi } from 'vitest';
import app from '../../src/app.js';
import request from 'supertest';

import env from '../../src/helpers/env.js';
import { requestWithFormData } from '../../src/helpers/requestWithFormData.js';
import sharedRenderer from '../../src/renderers/shared.renderer.js';

vi.mock('../../src/middlewares/csrf-protection.middleware.js', () => ({
	default: (req, res, next) => {
		res.locals = res.locals || {};
		res.locals.csrfToken = 'test-csrf-token';
		return next();
	},
}));

describe('Login', () => {
	it('should login successfully with valid credentials', async () => {
		const res = await requestWithFormData(request(app), '/login', {
			username: 'admin',
			password: env.DEFAULT.SUPERADMIN_PASSWORD,
		});

		expect(res.status).toBe(302);
		expect(res.headers.location).toBe('http://localhost:3000/');
	});
	it('should not login successfully with invalid username', async () => {
		const spy = vi.spyOn(sharedRenderer, 'login');
		const res = await requestWithFormData(request(app), '/login', {
			username: 'not me',
			password: env.DEFAULT.SUPERADMIN_PASSWORD,
		});
		expect(res.status).toBe(200);
		expect(spy).toHaveBeenCalledWith(
			expect.any(Object),
			undefined,
			expect.any(Object),
			expect.objectContaining({
				username: expect.any(Object),
			})
		);
	});
	it('should not login successfully with invalid password', async () => {
		const spy = vi.spyOn(sharedRenderer, 'login');
		const res = await requestWithFormData(request(app), '/login', {
			username: 'admin',
			password: env.DEFAULT.SUPERADMIN_PASSWORD + '.invalid',
		});
		expect(res.status).toBe(200);
		expect(spy).toHaveBeenCalledWith(
			expect.any(Object),
			undefined,
			expect.any(Object),
			expect.objectContaining({
				password: expect.any(Object),
			})
		);
	});
});
