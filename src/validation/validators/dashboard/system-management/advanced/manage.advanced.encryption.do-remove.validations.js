import { body } from 'express-validator';
import localize from '../../../../localize.js';
import { checkKeyslotPassword, getKeysSlots } from '../../../../../services/launcher.service.js';

export default [
	body('idIndex')
		.exists({ checkFalsy: true })
		.withMessage(localize('validation.advanced.encryption.idIndex.required'))
		.bail()
		.escape()
		.isNumeric()
		.toInt()
		.withMessage(localize('validation.advanced.encryption.idIndex.format'))
		.bail()
		.custom((value) => {
			const keySlotsIndecies = getKeysSlots().map((v) => v.idIndex);
			return keySlotsIndecies.indexOf(value) != -1;
		})
		.withMessage(localize('validation.advanced.encryption.idIndex.invalid')),
	body('passwordCurrent')
		.exists({ checkFalsy: true })
		.bail()
		.withMessage(localize('validation.password.required'))
		.custom(async (value, { req }) => {
			if (checkKeyslotPassword(value)) return true;
			else throw new Error(req.__('validation.password.incorrect'));
		}),
];
