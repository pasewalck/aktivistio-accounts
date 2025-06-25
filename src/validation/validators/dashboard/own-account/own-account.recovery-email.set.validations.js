import { body } from "express-validator";
import localize from "../../../localize.js";
import currentUserPasswordValidator from "../../../util-validators/current-user-password.validator.js";

export default [
    currentUserPasswordValidator(body('currentPassword')),
    body("email").notEmpty().withMessage(localize('A recovery email must be selected.')).bail()
        .escape()
        .isEmail().withMessage(localize('Email is not valid.'))
]