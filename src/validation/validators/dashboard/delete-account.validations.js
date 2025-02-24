import { body } from "express-validator";
import currentUserPasswordValidator from "../../util-validators/create-password.validator.js";

export default [
    currentUserPasswordValidator(body('currentPassword')),
    body("confirm")
        .equals(true).withMessage("Missing confirmation").bail()
]