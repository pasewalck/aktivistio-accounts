import { body } from "express-validator"

import localize from "../../localize.js"
import createPasswordValidator from "../../util-validators/create-password.validator.js"

export default [
  createPasswordValidator(body("password")),
  body('confirmPassword')
    .exists({checkFalsy: true}).withMessage(localize('Password must be confirmed.')).bail()
    .escape()
    .custom((value, {req}) => value === req.body.password).withMessage(localize('You confirm password does not match.')),
  ]