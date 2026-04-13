import { body } from 'express-validator';

import localize from '../../../localize.js';
import invitesService from '../../../../services/invites.service.js';
import { hasPermission, Permission } from '../../../../models/roles.js';

export default [
	body('code')
		.exists({ checkFalsy: true })
		.withMessage(localize('validation.invite.code.required'))
		.bail()
		.escape()
		.isAlphanumeric()
		.withMessage(localize('validation.invite.code.format_invalid'))
		.bail()
		.custom((value, { req }) => {
			const invite = invitesService.getByCode(value);
			return invite != null && invite.isSystemInvite()
				? hasPermission(req.account.role, Permission.MANAGE_SYSTEM_INVITES)
				: (req.account.id = invite.account.id);
		})
		.withMessage(localize('validation.invite.code.invalid')),
];
