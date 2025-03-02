import { body } from "express-validator"

import localize from "../../localize.js";
import createPasswordValidator from "../../util-validators/create-password.validator.js";
import currentUserPasswordValidatorCopy from "../../util-validators/current-user-password.validator.js";

export default [
    currentUserPasswordValidatorCopy(body('currentPassword')),
    createPasswordValidator(body('newPassword')),
    body('confirmNewPassword')
      .exists({checkFalsy: true}).withMessage(localize('Password must be confirmed.')).bail()
      .custom((value, {req}) => value === req.body.newPassword).withMessage(localize('Your confirm password does not match.')),
    
  ]