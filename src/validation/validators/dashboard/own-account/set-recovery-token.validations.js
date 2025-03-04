import { body } from "express-validator";
import currentUserPasswordValidator from "../../../util-validators/create-password.validator.js";
import recoveryTokenValidator from "../../../util-validators/recovery-token.validator.js";

export default [
    currentUserPasswordValidator(body('currentPassword')),
    recoveryTokenValidator(body('token')),
    body("tokenVerify")
        .customSanitizer(input => {
            console.log(input)
            return Boolean(input)
        })
        .custom((value) => value == true).withMessage("Recovery token must be confirmed").bail()
]