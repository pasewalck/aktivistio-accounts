import { describe, it, expect, vi, beforeEach } from 'vitest';
import sharedController from '../../../src/controllers/shared.controller.js';
import { matchedData, validationResult } from 'express-validator';
import sharedRenderer from '../../../src/renderers/shared.renderer.js';
import accountService from '../../../src/services/account.service.js';
import auditService from '../../../src/services/audit.service.js';
import { AuditActionType } from '../../../src/models/audit-action-types.js';
import { UnexpectedClientError } from '../../../src/models/errors.js';
import { setProviderSession } from '../../../src/helpers/oidc/session.js';

vi.mock('../../../src/helpers/oidc/provider.js', () => ({
	default: {
		interactionDetails: vi.fn(),
		interactionFinished: vi.fn(),
	},
}));
vi.mock('express-validator');
vi.mock('../../../src/helpers/oidc/session.js');
vi.mock('../../../src/renderers/shared.renderer.js');
vi.mock('../../../src/services/account.service.js', () => ({
	default: {
		find: {
			withUsername: vi.fn(),
			withId: vi.fn(),
		},
		checkLogin: vi.fn(),
		twoFactorAuth: {
			get: vi.fn(),
			check: vi.fn(),
		},
		lastLogin: {
			register: vi.fn(),
		},
	},
}));
vi.mock('../../../src/services/audit.service.js', () => ({
	default: {
		appendAuditLog: vi.fn(),
	},
}));

describe('shared.controller', () => {
	let req, res;

	beforeEach(() => {
		vi.clearAllMocks();
		req = {
			session: {},
			__: vi.fn((s) => s),
		};
		res = {
			redirect: vi.fn(),
			__: vi.fn((s) => s),
		};
	});

	describe('loginPost', () => {
		it('should render login page with errors if validation fails', async () => {
			const mockErrors = {
				isEmpty: () => false,
				mapped: () => ({ username: { msg: 'invalid' } }),
			};
			vi.mocked(validationResult).mockResolvedValue(mockErrors);
			vi.mocked(matchedData).mockResolvedValue({ username: 'testuser' });
			vi.mocked(accountService.find.withUsername).mockReturnValue({ id: 'acc1' });

			await sharedController.loginPost(req, res);

			expect(auditService.appendAuditLog).toHaveBeenCalledWith({ id: 'acc1' }, AuditActionType.LOGIN_FAIL, req);
			expect(sharedRenderer.login).toHaveBeenCalledWith(
				res,
				undefined,
				{ username: 'testuser' },
				expect.any(Object)
			);
		});

		it('should proceed to 2FA if account has 2FA enabled and validated', async () => {
			vi.mocked(validationResult).mockResolvedValue({ isEmpty: () => true });
			vi.mocked(matchedData).mockResolvedValue({ username: 'testuser', password: 'password' });
			const mockAccount = { id: 'acc1' };
			vi.mocked(accountService.checkLogin).mockResolvedValue(mockAccount);
			vi.mocked(accountService.twoFactorAuth.get).mockReturnValue({});

			// Mock crypto.randomUUID
			const uuid = '1234-5678';
			vi.stubGlobal('crypto', { randomUUID: () => uuid });

			await sharedController.loginPost(req, res);

			expect(req.session.twoFactorLogin).toEqual({
				loginToken: uuid,
				accountId: 'acc1',
				attempts: 0,
			});
			expect(sharedRenderer.twoFactorAuth).toHaveBeenCalledWith(res, undefined, uuid);
		});

		it('should doLogin directly if 2FA is NOT enabled', async () => {
			vi.mocked(validationResult).mockResolvedValue({ isEmpty: () => true });
			vi.mocked(matchedData).mockResolvedValue({ username: 'testuser', password: 'password' });
			const mockAccount = { id: 'acc1', username: 'testuser' };
			vi.mocked(accountService.checkLogin).mockResolvedValue(mockAccount);
			vi.mocked(accountService.twoFactorAuth.get).mockReturnValue(null);
			vi.mocked(accountService.find.withId).mockReturnValue(mockAccount);
			vi.mocked(setProviderSession);

			await sharedController.loginPost(req, res);

			expect(auditService.appendAuditLog).toHaveBeenCalledWith(
				{ id: 'acc1' },
				AuditActionType.LOGIN_SUCCESS,
				req
			);
			expect(setProviderSession).toHaveBeenCalledWith(expect.any(Object), req, res, { accountId: 'acc1' });
			expect(res.redirect).toHaveBeenCalled();
		});

		it('should throw UnexpectedClientError if login fails', async () => {
			vi.mocked(validationResult).mockResolvedValue({ isEmpty: () => true });
			vi.mocked(matchedData).mockResolvedValue({ username: 'testuser', password: 'password' });
			vi.mocked(accountService.checkLogin).mockResolvedValue(null);

			await expect(sharedController.loginPost(req, res)).rejects.toThrow(UnexpectedClientError);
		});
	});

	describe('loginSecondFactorPost', () => {
		it('should throw error if twoFactorLoginToken is missing in data', async () => {
			vi.mocked(validationResult).mockResolvedValue({ isEmpty: () => true });
			vi.mocked(matchedData).mockResolvedValue({});
			await expect(sharedController.loginSecondFactorPost(req, res)).rejects.toThrow(UnexpectedClientError);
		});

		it('should render login page if no twoFactorLogin session exists', async () => {
			vi.mocked(validationResult).mockResolvedValue({ isEmpty: () => true });
			vi.mocked(matchedData).mockResolvedValue({ twoFactorLoginToken: 'token' });
			await sharedController.loginSecondFactorPost(req, res);
			expect(sharedRenderer.login).toHaveBeenCalled();
		});

		it('should render 2FA page with errors if validation fails', async () => {
			const mockErrors = {
				isEmpty: () => false,
				mapped: () => ({ token: { msg: 'invalid' } }),
			};
			const mockedData = { twoFactorLoginToken: 'token', username: 'user' };
			vi.mocked(validationResult).mockResolvedValue(mockErrors);
			vi.mocked(matchedData).mockResolvedValue(mockedData);
			req.session.twoFactorLogin = { accountId: 'acc1', loginToken: 'token', attempts: 0 };

			await sharedController.loginSecondFactorPost(req, res);

			expect(sharedRenderer.twoFactorAuth).toHaveBeenCalledWith(
				res,
				undefined,
				mockedData.twoFactorLoginToken,
				expect.any(Object)
			);
			expect(req.session.twoFactorLogin.attempts).toBe(1);
		});

		it('should login if 2FA token is valid', async () => {
			vi.mocked(validationResult).mockResolvedValue({ isEmpty: () => true });
			vi.mocked(matchedData).mockResolvedValue({ twoFactorLoginToken: 'token', token: '123456' });
			req.session.twoFactorLogin = { accountId: 'acc1', loginToken: 'token' };
			const mockAccount = { id: 'acc1' };
			vi.mocked(accountService.find.withId).mockReturnValue(mockAccount);
			vi.mocked(accountService.twoFactorAuth.check).mockReturnValue(true);
			vi.mocked(setProviderSession);

			await sharedController.loginSecondFactorPost(req, res);

			expect(setProviderSession).toHaveBeenCalledWith(expect.any(Object), req, res, { accountId: 'acc1' });
			expect(auditService.appendAuditLog).toHaveBeenCalledWith(
				{ id: 'acc1' },
				AuditActionType.LOGIN_SUCCESS,
				req
			);
		});

		it('should throw error if 2FA token is invalid', async () => {
			vi.mocked(validationResult).mockResolvedValue({ isEmpty: () => true });
			vi.mocked(matchedData).mockResolvedValue({ twoFactorLoginToken: 'token', token: 'invalid' });
			req.session.twoFactorLogin = { accountId: 'acc1', loginToken: 'token' };
			const mockAccount = { id: 'acc1' };
			vi.mocked(accountService.find.withId).mockReturnValue(mockAccount);
			vi.mocked(accountService.twoFactorAuth.check).mockReturnValue(false);

			await expect(sharedController.loginSecondFactorPost(req, res)).rejects.toThrow(UnexpectedClientError);
		});
	});
});
