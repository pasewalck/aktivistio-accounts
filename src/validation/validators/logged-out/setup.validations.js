import { body } from "express-validator"
import localize from "../../localize.js";
import createPasswordValidator from "../../util-validators/create-password.validator.js";
import recoveryTokenValidator from "../../util-validators/recovery-token.validator.js";

export default [
  createPasswordValidator(body("password")),
  body('passwordConfirm')
    .exists({checkFalsy: true}).withMessage(localize('validation.password.confirmation_required')).bail()
    .escape()
    .custom((value, {req}) => value === req.body.password).withMessage(localize('validation.password.confirmation_mismatch')),
  body("recoveryMethod")
    .exists({checkFalsy: true}).withMessage(localize('validation.recovery.method.required')).bail()
    .escape()
    .isString()
    .isIn(['email','token']).withMessage(localize('validation.recovery.method.invalid')),     
  body('recoveryEmail')
    .if(body('recoveryMethod')
      .equals('email'))
        .notEmpty().withMessage(localize('validation.recovery.email.selection_required')).bail()
        .escape()
        .isEmail().withMessage(localize('validation.recovery.email.format_invalid')),
  recoveryTokenValidator(body('recoveryToken')
    .if(body('recoveryMethod')
      .equals('token'))),
  body("recoveryTokenVerify")
    .customSanitizer(input => {
      return Boolean(input)
    })
    .if(body('recoveryMethod')
      .equals('token'))
        .custom((value) => value == true).withMessage(localize("validation.recovery.token.confirmation_required")).bail()
]
