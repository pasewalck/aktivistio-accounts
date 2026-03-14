import { body } from 'express-validator';

import localize from '../../../localize.js';
import invitesService from '../../../../services/invites.service.js';

export default [
	body('code')
		.exists({ checkFalsy: true })
		.withMessage(localize('auth.invite.code.required'))
		.bail()
		.escape()
		.isAlphanumeric()
		.withMessage(localize('auth.invite.code.format_invalid'))
		.bail()
		.custom((value) => !!invitesService.validate(value))
		.withMessage(localize('auth.invite.code.invalid')),
];
