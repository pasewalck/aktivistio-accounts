import { param } from 'express-validator';
import localize from '../../../../localize.js';
import { getKeysSlots } from '../../../../../services/launcher.service.js';

export default [
	param('idIndex')
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
];
