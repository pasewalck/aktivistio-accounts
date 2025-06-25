import { body } from "express-validator";
import currentUserPasswordValidator from "../../../util-validators/current-user-password.validator.js";
import recoveryTokenValidator from "../../../util-validators/recovery-token.validator.js";
import localize from "../../../localize.js";

export default [
    currentUserPasswordValidator(body('currentPassword')),
    recoveryTokenValidator(body('token')),
    body("tokenVerify")
        .customSanitizer(input => {
            return Boolean(input)
        })
        .custom((value) => value == true).withMessage(localize("Recovery token must be confirmed")).bail()
]