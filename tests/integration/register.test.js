import { describe, it, expect, vi } from 'vitest';
import app from '../../src/app.js';
import request from 'supertest';

import { requestWithFormData } from '../../src/helpers/requestWithFormData.js';
import invitesService from '../../src/services/invites.service.js';
import { generateRecoveryToken } from '../../src/helpers/recovery-token-string.js';
import loggedOutDashboardRenderer from '../../src/renderers/logged-out.dashboard.renderer.js';

vi.mock('../../src/middlewares/csrf-protection.middleware.js', () => ({
	default: (req, res, next) => {
		res.locals = res.locals || {};
		res.locals.csrfToken = 'test-csrf-token';
		return next();
	},
}));

describe('Login', () => {
	const inviteCode = invitesService.generate.single();
	const password = 'csafeH9YaWfPTlv3Dz3s0I6EwlCYmFpUbXL';
	const recoveryToken = generateRecoveryToken();

	it('should register successfully with valid invite code', async () => {
		const password = 'csafeH9YaWfPTlv3Dz3s0I6EwlCYmFpUbXL';
		const recoveryToken = generateRecoveryToken();

		const spyInitAccountPageConsent = vi.spyOn(loggedOutDashboardRenderer, 'initAccountPageConsent');

		let agent = request.agent(app);

		let res = await requestWithFormData(agent, '/register/', {
			inviteCode: inviteCode,
			username: 'jona',
			password: password,
			passwordConfirm: password,
			recoveryMethod: 'token',
			recoveryToken: recoveryToken,
			recoveryTokenVerify: true,
		});

		expect(res.status).toBe(200);
		expect(spyInitAccountPageConsent).toHaveBeenCalled();

		res = await requestWithFormData(agent, '/register/consent/', {
			verify: 'checked',
		});

		expect(res.status).toBe(302);
		expect(res.headers.location).toBe('http://localhost:3000/');
	});
	it('should not register successfully with invalid invite code', async () => {
		const spyInitAccountPage = vi.spyOn(loggedOutDashboardRenderer, 'initAccountPage');

		let res = await requestWithFormData(request(app), '/register/', {
			inviteCode: 'fake',
			username: 'peter',
			password: password,
			passwordConfirm: password,
			recoveryMethod: 'token',
			recoveryToken: recoveryToken,
			recoveryTokenVerify: true,
		});

		expect(spyInitAccountPage).toHaveBeenCalledWith(
			expect.any(Object),
			true,
			expect.any(Object),
			expect.objectContaining({
				inviteCode: expect.any(Object),
			})
		);

		expect(res.status).toBe(200);
	});
	it('should not register successfully with valid invite code but occupied username', async () => {
		const spyInitAccountPage = vi.spyOn(loggedOutDashboardRenderer, 'initAccountPage');

		let res = await requestWithFormData(request(app), '/register/', {
			inviteCode: inviteCode,
			username: 'admin',
			password: password,
			passwordConfirm: password,
			recoveryMethod: 'token',
			recoveryToken: recoveryToken,
			recoveryTokenVerify: true,
		});

		expect(spyInitAccountPage).toHaveBeenCalledWith(
			expect.any(Object),
			true,
			expect.any(Object),
			expect.objectContaining({
				username: expect.any(Object),
			})
		);
		expect(res.status).toBe(200);
	});
});
