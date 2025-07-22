import { body } from "express-validator";

import localize from "../../../localize.js";
import invitesService from "../../../../services/invites.service.js";

export default [
    body("code")
        .exists({checkFalsy: true}).withMessage(localize('invite.code.required')).bail()
        .escape()
        .isAlphanumeric().withMessage(localize('invite.code.format_invalid')).bail()
        .custom((value) => (!!invitesService.validate(value))).withMessage(localize('invite.code.invalid')),
]
