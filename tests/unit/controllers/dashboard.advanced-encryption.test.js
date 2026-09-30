import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validationResult, matchedData } from 'express-validator';
import dashboardController from '../../../src/controllers/dashboard.controller.js';
import dashboardRenderer from '../../../src/renderers/dashboard.renderer.js';
import { addKeySlot, removeKeySlot } from '../../../src/services/launcher.service.js';
import { ClientError } from '../../../src/models/errors.js';

vi.mock('express-validator');
vi.mock('../../../src/renderers/dashboard.renderer.js');
vi.mock('../../../src/services/launcher.service.js', () => ({
	addKeySlot: vi.fn(),
	removeKeySlot: vi.fn(),
}));

describe('dashboard.controller advanced encryption', () => {
	let req, res;

	beforeEach(() => {
		vi.clearAllMocks();
		req = { __: vi.fn((key) => key) };
		res = {
			render: vi.fn(),
			redirect: vi.fn(),
			__: vi.fn((key) => key),
		};
	});

	describe('advancedEncryption', () => {
		it('delegates rendering to the dashboard renderer', async () => {
			await dashboardController.advancedEncryption(req, res);

			expect(dashboardRenderer.advancedEncryption).toHaveBeenCalledWith(req, res);
		});
	});

	describe('advancedEncryptionKillPost', () => {
		it('throws a ClientError when validation fails', async () => {
			vi.mocked(validationResult).mockResolvedValue({
				isEmpty: () => false,
				array: () => [{ msg: 'invalid id index' }],
			});
			vi.mocked(matchedData).mockResolvedValue({});

			await expect(dashboardController.advancedEncryptionKillPost(req, res)).rejects.toThrow(ClientError);
			expect(removeKeySlot).not.toHaveBeenCalled();
		});

		it('removes the key slot and redirects on success', async () => {
			vi.mocked(validationResult).mockResolvedValue({ isEmpty: () => true });
			vi.mocked(matchedData).mockResolvedValue({ idIndex: 1 });
			removeKeySlot.mockReturnValue(true);

			await dashboardController.advancedEncryptionKillPost(req, res);

			expect(removeKeySlot).toHaveBeenCalledWith(1);
			expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining('advanced/encryption'));
		});

		it('throws a ClientError when the key slot could not be removed', async () => {
			vi.mocked(validationResult).mockResolvedValue({ isEmpty: () => true });
			vi.mocked(matchedData).mockResolvedValue({ idIndex: 1 });
			removeKeySlot.mockReturnValue(false);

			await expect(dashboardController.advancedEncryptionKillPost(req, res)).rejects.toThrow(ClientError);
			expect(res.redirect).not.toHaveBeenCalled();
		});
	});

	describe('advancedEncryptionAddPost', () => {
		it('re-renders the page with errors when validation fails', async () => {
			const mappedErrors = { password: { msg: 'required' } };
			vi.mocked(validationResult).mockResolvedValue({
				isEmpty: () => false,
				mapped: () => mappedErrors,
			});
			vi.mocked(matchedData).mockResolvedValue({ name: 'My Keyslot' });

			await dashboardController.advancedEncryptionAddPost(req, res);

			expect(dashboardRenderer.advancedEncryption).toHaveBeenCalledWith(
				req,
				res,
				{ name: 'My Keyslot' },
				mappedErrors
			);
			expect(addKeySlot).not.toHaveBeenCalled();
		});

		it('adds the key slot and redirects on success', async () => {
			vi.mocked(validationResult).mockResolvedValue({ isEmpty: () => true });
			vi.mocked(matchedData).mockResolvedValue({
				password: 'new-password',
				name: 'My Keyslot',
				passwordCurrent: 'current-password',
			});
			addKeySlot.mockReturnValue(true);

			await dashboardController.advancedEncryptionAddPost(req, res);

			expect(addKeySlot).toHaveBeenCalledWith('new-password', 'My Keyslot', 'current-password');
			expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining('advanced/encryption'));
		});

		it('throws a ClientError when the current password is incorrect', async () => {
			vi.mocked(validationResult).mockResolvedValue({ isEmpty: () => true });
			vi.mocked(matchedData).mockResolvedValue({
				password: 'new-password',
				passwordCurrent: 'wrong-password',
			});
			addKeySlot.mockReturnValue(false);

			await expect(dashboardController.advancedEncryptionAddPost(req, res)).rejects.toThrow(ClientError);
			expect(res.redirect).not.toHaveBeenCalled();
		});
	});
});
