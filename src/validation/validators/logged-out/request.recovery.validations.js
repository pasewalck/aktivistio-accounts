import { body } from "express-validator"

import { isRecoveryToken } from "../../../helpers/recovery-token-string.js"
import localize from "../../localize.js"

export default [
    body("username")
      .exists({checkFalsy: true}).withMessage(localize('A username is required.')).bail()
      .escape()
      .toLowerCase()
      .isAlphanumeric(),
    body("recoveryMethod")
      .exists({checkFalsy: true}).withMessage(localize('A recovery method must be defined.')).bail()
      .escape()
      .isString()
      .isIn(['email','token']).withMessage(localize('A valid recovery method must be defined.')),
    body('recoveryEmail')
      .if(body('recoveryMethod')
        .equals('email'))
          .notEmpty().withMessage(localize('A recovery email must be selected.')).bail()
          .escape()
          .isEmail().withMessage(localize('Email is not valid.')),
    body('recoveryToken')
      .if(body('recoveryMethod')
        .equals('token'))
          .notEmpty().withMessage(localize('A valid recovery token must be selected.')).bail()
          .escape()
          .custom((value) => isRecoveryToken(value)).withMessage(localize('Recovery token is not in valid format'))
  ]