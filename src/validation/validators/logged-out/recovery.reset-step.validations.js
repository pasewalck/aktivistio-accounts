import { body } from "express-validator"

import localize from "../../localize.js"
import createPasswordValidator from "../../util-validators/create-password.validator.js"

export default [
  createPasswordValidator(body("password")),
  body('confirmPassword')
    .exists({checkFalsy: true}).withMessage(localize('validation.password.confirmation_required')).bail()
    .custom((value, {req}) => value === req.body.password).withMessage(localize('validation.password.confirmation_mismatch')),
]
