import { validationResult } from 'express-validator';

/**
 * Builds a mock Express request object suitable for running express-validator chains.
 *
 * @param {object} opts
 * @param {object} [opts.body={}]
 * @param {object} [opts.params={}]
 * @param {object} [opts.query={}]
 * @param {object} [opts.session={}]
 * @param {object|null} [opts.account=null]
 * @returns {object} Mock request
 */
export function mockReq({ body = {}, params = {}, query = {}, session = {}, account = null } = {}) {
	return {
		body,
		params,
		query,
		session,
		account,
		// i18n stub: returns the key so test assertions can use the key string
		__: (msg) => msg,
	};
}

/**
 * Runs an array of express-validator ValidationChain instances against a mock request.
 *
 * @param {import('express-validator').ValidationChain[]} validators
 * @param {object} req - Mock request (from mockReq)
 * @returns {Promise<import('express-validator').Result>}
 */
export async function runValidators(validators, req) {
	for (const chain of validators) {
		await chain.run(req);
	}
	return validationResult(req);
}

/**
 * Returns the unique field names (paths) that have validation errors.
 *
 * @param {import('express-validator').Result} result
 * @returns {string[]}
 */
export function errorFields(result) {
	return [...new Set(result.array().map((e) => e.path))];
}

/**
 * Returns all errors as {field, msg} pairs.
 *
 * @param {import('express-validator').Result} result
 * @returns {{field: string, msg: string}[]}
 */
export function getErrors(result) {
	return result.array().map((e) => ({ field: e.path, msg: e.msg }));
}
