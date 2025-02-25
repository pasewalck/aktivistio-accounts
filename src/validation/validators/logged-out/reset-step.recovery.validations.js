import { body } from "express-validator"

import localize from "../../localize.js"
import createPasswordValidator from "../../util-validators/create-password.validator.js"

export default [
    body("confirmCode")
      .exists({checkFalsy: true}).withMessage(localize('A code is required.')).bail()
      .escape()
      .isInt()
      .toInt()
      .custom((value,{req}) => value == req.session?.accountRecovery?.confirmCode).withMessage(localize('Confirm code is incorrect')),
    createPasswordValidator(body("password")),
  ]