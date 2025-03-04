import { body, param } from "express-validator";

import localize from "../../../localize.js";
import invitesService from "../../../../services/invites.service.js";

export default [
    body("invite").exists({checkFalsy: true}).withMessage(localize('Invite code is not defined')).bail()
        .escape()
        .isAlphanumeric().withMessage(localize('Invite code format is invalid')).bail()
        .custom((value) => (!!invitesService.validate(value))).withMessage(localize('Invite code is invalid')),
]
