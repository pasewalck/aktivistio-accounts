import { param } from "express-validator";
import localize from "../../../localize.js";
import invitesService from "../../../../services/invites.service.js";

export default [
    param("invite")
        .exists({checkFalsy: true}).withMessage(localize('invite.param.required')).bail()
        .escape()
        .isAlphanumeric().withMessage(localize('invite.param.format_invalid')).bail()
        .custom((value) => (!!invitesService.validate(value))).withMessage(localize('invite.param.invalid')),
]
