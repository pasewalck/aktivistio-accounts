import { describe, it, expect } from 'vitest';
import twoFactorAuth from '../../../src/helpers/two-factor-auth.js';

describe('twoFactorAuth', () => {
	describe('generateSecret', () => {
		it('should generate a valid base32 string (A-Z, 2-7)', () => {
			const secret = twoFactorAuth.generateSecret();
			const base32Regex = /^[A-Z2-7]+$/;
			expect(base32Regex.test(secret)).toBe(true);
		});
	});

	describe('verify', () => {
		it('should return false for invalid token', () => {
			const secret = 'JBSWY3DPEHPK3PXP';
			const result = twoFactorAuth.verify(secret, '000000');
			expect(result).toBe(false);
		});

		it('should return true for valid token (window allows ±2 steps)', () => {
			const secret = twoFactorAuth.generateSecret();
			const result = twoFactorAuth.verify(secret, twoFactorAuth.generateToken(secret));
			expect(result).toBe(true);
		});

		it('should return false for empty secret', () => {
			const result = twoFactorAuth.verify('', '123456');
			expect(result).toBe(false);
		});

		it('should return false for empty token', () => {
			const secret = twoFactorAuth.generateSecret();
			const result = twoFactorAuth.verify(secret, '');
			expect(result).toBe(false);
		});
	});
});
