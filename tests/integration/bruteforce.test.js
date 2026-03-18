import { describe, it, expect, vi } from 'vitest';
import app from '../../src/app.js';
import request from 'supertest';

import env from '../../src/helpers/env.js';
import { requestWithFormData } from '../../src/helpers/requestWithFormData.js';

vi.mock('../../src/middlewares/csrf-protection.middleware.js', () => ({
	default: (req, res, next) => {
		res.locals = res.locals || {};
		res.locals.csrfToken = 'test-csrf-token';
		return next();
	},
}));

describe('Bruteforce', () => {
	it('should block connection for too many bad logins ', async () => {
		const attempts = env.RATE_LIMITER.MAX_LOGIN_ATTEMPTS + 1;
		const agent = request.agent(app);
		let res;
		for (let i = 0; i < attempts; i++) {
			res = await requestWithFormData(agent, '/login', {
				username: 'admin',
				password: env.DEFAULT.SUPERADMIN_PASSWORD + '.invalid',
			});

			if (res.status != 200) break;
		}
		expect(res.status).toBe(429);
	});
});
