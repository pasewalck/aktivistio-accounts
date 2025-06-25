import { body } from "express-validator";

import currentUserPasswordValidator from "../../../util-validators/current-user-password.validator.js";

export default [
    currentUserPasswordValidator(body('currentPassword'))
]