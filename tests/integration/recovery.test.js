import { describe, it, expect, vi } from 'vitest';
import app from '../../src/app.js';
import request from 'supertest';

import { requestWithFormData } from '../../src/helpers/requestWithFormData.js';
import accountService from '../../src/services/account.service.js';
import mailService from '../../src/services/mail.service.js';
import { generateRecoveryToken } from '../../src/helpers/recovery-token-string.js';
import { PasswordResetChannels } from '../../src/models/action-token-types.js';
import loggedOutDashboardRenderer from '../../src/renderers/logged-out.dashboard.renderer.js';

vi.mock('../../src/middlewares/csrf-protection.middleware.js', () => ({
	default: (req, res, next) => {
		res.locals = res.locals || {};
		res.locals.csrfToken = 'test-csrf-token';
		return next();
	},
}));

vi.mock('../../src/services/mail.service.js', () => ({
	default: {
		send: {
			inviteCode: vi.fn(),
			setupLink: vi.fn(),
			recoveryLink: vi.fn(),
		},
	},
}));

describe('Recovery', async () => {
	const recoveryToken = generateRecoveryToken();
	const recoveryEmail = 'admin@example.com';
	const password = 'csafeH9YaWfPTlv3Dz3s0I6EwlCYmFpUbXL';

	const account = accountService.find.withUsername('admin');
	await accountService.recovery.email.set(account, recoveryEmail);
	await accountService.recovery.token.set(account, recoveryToken);

	it('should recover account successfully with valid recovery link', async () => {
		const link = accountService.actionLink.createRecoveryLink(account, PasswordResetChannels.EMAIL);

		let agent = request.agent(app);

		let res = await agent.get(link.pathname);

		expect(res.status).toBe(200);

		res = await requestWithFormData(agent, link.pathname, {
			password: password,
			confirmPassword: password,
		});

		expect(res.status).toBe(302);
		expect(res.headers.location).toBe('http://localhost:3000/login');
	});

	it('should get recovery link successfully with valid recovery email', async () => {
		const spyRecoveryEmailSend = vi.spyOn(mailService.send, 'recoveryLink');

		let res = await requestWithFormData(request(app), '/account-recovery/request/', {
			username: 'admin',
			method: 'email',
			email: recoveryEmail,
		});

		expect(res.status).toBe(200);
		expect(spyRecoveryEmailSend).toHaveBeenCalled();

		const calls = spyRecoveryEmailSend.mock.calls;
		const link = calls[0][0];

		expect(link).toBeInstanceOf(URL);
	});

	it('should redirect to recovery link successfully with valid recovery token', async () => {
		let res = await requestWithFormData(request(app), '/account-recovery/request/', {
			username: 'admin',
			method: 'token',
			token: recoveryToken,
		});

		expect(res.status).toBe(302);
	});

	it('should not redirect to recovery link with invalid recovery token', async () => {
		const spy = vi.spyOn(loggedOutDashboardRenderer, 'recoveryRequest');

		let res = await requestWithFormData(request(app), '/account-recovery/request/', {
			username: 'admin',
			method: 'token',
			token: generateRecoveryToken(),
		});

		expect(res.status).toBe(200);
		expect(spy).toHaveBeenCalledWith(
			expect.any(Object),
			expect.any(Object),
			expect.objectContaining({
				token: expect.any(Object),
			})
		);
	});

	it('should not send recovery link email for invalid recovery email', async () => {
		const spy = vi.spyOn(loggedOutDashboardRenderer, 'recoveryRequest');

		let res = await requestWithFormData(request(app), '/account-recovery/request/', {
			username: 'admin',
			method: 'email',
			email: 'invalid@invalid.com',
		});

		expect(res.status).toBe(200);
		expect(spy).toHaveBeenCalledWith(
			expect.any(Object),
			expect.any(Object),
			expect.objectContaining({
				email: expect.any(Object),
			})
		);
	});
});
