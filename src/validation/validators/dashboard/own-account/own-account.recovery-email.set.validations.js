import { body } from "express-validator";
import localize from "../../../localize.js";
import currentUserPasswordValidator from "../../../util-validators/current-user-password.validator.js";

export default [
    currentUserPasswordValidator(body('currentPassword')),
    body("email").notEmpty().withMessage(localize('email.recovery.required')).bail()
        .escape()
        .isEmail().withMessage(localize('email.format.invalid'))
]
