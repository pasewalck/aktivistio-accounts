import { describe, it, expect, vi } from 'vitest';
import app from '../../src/app.js';
import request from 'supertest';

import { requestWithFormData } from '../../src/helpers/requestWithFormData.js';
import accountService from '../../src/services/account.service.js';
import mailService from '../../src/services/mail.service.js';
import { generateRecoveryToken } from '../../src/helpers/recovery-token-string.js';

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

	it('should recover account successfully with valid recovery email', async () => {
		const spyRecoveryEmailSend = vi.spyOn(mailService.send, 'recoveryLink');

		let agent = request.agent(app);

		let res = await requestWithFormData(agent, '/account-recovery/request/', {
			username: 'admin',
			method: 'email',
			email: recoveryEmail,
		});

		expect(res.status).toBe(200);
		expect(spyRecoveryEmailSend).toHaveBeenCalled();

		const calls = spyRecoveryEmailSend.mock.calls;
		const link = calls[0][0];

		res = await agent.get(link.pathname);

		expect(res.status).toBe(200);

		res = await requestWithFormData(agent, link.pathname, {
			password: password,
			confirmPassword: password,
		});

		expect(res.status).toBe(302);
		expect(res.headers.location).toBe('http://localhost:3000/login');
	});
});
