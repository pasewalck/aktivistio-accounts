import { body } from 'express-validator';
import localize from '../../../../localize.js';
import { checkKeyslotPassword } from '../../../../../services/launcher.service.js';
import createPasswordValidator from '../../../../util-validators/create-password.validator.js';

export default [
	body('passwordCurrent')
		.exists({ checkFalsy: true })
		.bail()
		.withMessage(localize('validation.password.required'))
		.custom(async (value, { req }) => {
			if (checkKeyslotPassword(value)) return true;
			else throw new Error(req.__('validation.password.incorrect'));
		}),
	body('name').optional({ checkFalsy: true }).escape(),
	createPasswordValidator(body('password')),
];
