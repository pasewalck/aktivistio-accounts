import { body } from "express-validator";
import currentUserPasswordValidator from "../../util-validators/create-password.validator.js";
import recoveryTokenValidator from "../../util-validators/recovery-token.validator.js";

export default [
    currentUserPasswordValidator(body('currentPassword')),
    recoveryTokenValidator(body('recoveryToken')),
    body("recoveryTokenVerify")
        .customSanitizer(input => {
            return Boolean(input)
        })
        .custom((value) => value == true).withMessage("Recovery must be confirmed").bail()

]