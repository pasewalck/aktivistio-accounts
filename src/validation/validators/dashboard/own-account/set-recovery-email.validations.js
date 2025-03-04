import { body } from "express-validator";
import currentUserPasswordValidator from "../../../util-validators/create-password.validator.js";
import localize from "../../../localize.js";

export default [
    currentUserPasswordValidator(body('currentPassword')),
    body("email").notEmpty().withMessage(localize('A recovery email must be selected.')).bail()
        .escape()
        .isEmail().withMessage(localize('Email is not valid.'))
]