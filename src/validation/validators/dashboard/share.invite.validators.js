import { body, param } from "express-validator";

export default [
    param("invite").exists({checkFalsy: true}).withMessage(localize('Invite code is not defined')).bail()
        .escape()
        .isAlphanumeric().withMessage(localize('Invite code format is invalid')).bail()
        .custom((value) => (!!accountDriver.validateInvite(value))).withMessage(localize('Invite code is invalid')),
]
