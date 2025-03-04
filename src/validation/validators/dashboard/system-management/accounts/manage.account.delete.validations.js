import { body } from "express-validator";
import localize from "../../../../localize.js";
import currentUserPasswordValidator from "../../../../util-validators/current-user-password.validator.js";

export default [
    currentUserPasswordValidator(body('deleteAdminPassword')),
    body("deleteAdminConfirm")
        .customSanitizer(input => {
            return Boolean(input)
        })
        .custom((value) => value == true).withMessage(localize("Missing confirmation")).bail()
]