import { body } from "express-validator";
import localize from "../../../localize.js";
import currentUserPasswordValidatorCopy from "../../../util-validators/current-user-password.validator.js";

export default [
    currentUserPasswordValidatorCopy(body('currentPassword')),
    body("confirm")
        .customSanitizer(input => {
            return Boolean(input)
        })
        .custom((value) => value == true).withMessage(localize("Missing confirmation")).bail()
]