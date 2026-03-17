import { describe, it, expect, beforeEach } from 'vitest';
import app from '../../src/app.js';
import request from 'supertest';
import * as cheerio from 'cheerio';
import { requestWithFormData } from '../../src/helpers/requestWithFormData.js';

describe('Login', () => {
	let agent, csrfToken;

	beforeEach(async () => {
		agent = request.agent(app);
		let res = await agent.get('/login');
		let $ = cheerio.load(res.text);
		csrfToken = $('input[name="_csrf"]').val();
		expect(csrfToken).toBeDefined();
	});

	it('should login successfully with valid csrf token', async () => {
		const res = await requestWithFormData(agent, '/login', {
			_csrf: csrfToken,
		});
		expect(res.status).toBe(200);
	});
	it('should not login successfully with valid csrf token', async () => {
		const res = await requestWithFormData(agent, '/login', {
			_csrf: 'invalid',
		});
		expect(res.status).toBe(400);
	});
});
