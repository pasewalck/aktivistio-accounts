import { body } from "express-validator";
import localize from "../../../localize.js";
import currentUserPasswordValidator from "../../../util-validators/current-user-password.validator.js";

export default [
    currentUserPasswordValidator(body('password')),
    body("confirm")
        .customSanitizer(input => {
            return Boolean(input)
        })
        .custom((value) => value == true).withMessage(localize("confirmation.required")).bail()
]
