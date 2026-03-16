import { describe, it, expect } from 'vitest';
import { extendUrl, assembleUrl } from '../../../src/helpers/url.js';

describe('url', () => {
	describe('assembleUrl', () => {
		it('should combine URL segments with proper base', () => {
			const result = assembleUrl('https://example.com', 'path', 'to', 'resource');
			expect(result.href).toBe('https://example.com/path/to/resource');
		});

		it('should handle segments with leading slashes', () => {
			const result = assembleUrl('https://example.com', '/path/', '/to/');
			expect(result.href).toBe('https://example.com/path/to');
		});

		it('should handle segments with trailing slashes', () => {
			const result = assembleUrl('https://example.com', 'path/', 'to/');
			expect(result.href).toBe('https://example.com/path/to');
		});

		it('should handle empty segments', () => {
			const result = assembleUrl('https://example.com', '', 'path');
			expect(result.href).toBe('https://example.com//path');
		});

		it('should handle multiple slashes in segments', () => {
			const result = assembleUrl('https://example.com', '//path///to//');
			expect(result.href).toBe('https://example.com/path///to');
		});

		it('should handle query strings', () => {
			const result = assembleUrl('https://example.com', 'path?foo=bar');
			expect(result.href).toBe('https://example.com/path?foo=bar');
		});

		it('should handle hash fragments', () => {
			const result = assembleUrl('https://example.com', 'path#section');
			expect(result.href).toBe('https://example.com/path#section');
		});
	});

	describe('extendUrl', () => {
		it('should extend a base URL with relative paths', () => {
			const baseUrl = new URL('https://example.com');
			const result = extendUrl(baseUrl, 'path', 'to', 'resource');
			expect(result.href).toBe('https://example.com/path/to/resource');
		});

		it('should handle empty relative paths', () => {
			const baseUrl = new URL('https://example.com');
			const result = extendUrl(baseUrl);
			expect(result.href).toBe('https://example.com/');
		});

		it('should handle single relative path', () => {
			const baseUrl = new URL('https://example.com');
			const result = extendUrl(baseUrl, 'dashboard');
			expect(result.href).toBe('https://example.com/dashboard');
		});
	});
});
