import { body } from "express-validator"

import { isRecoveryToken } from "../../../helpers/recovery-token-string.js"
import localize from "../../localize.js"
import usernameExistsValidator from "../../util-validators/username-exists.validator.js"
import accountService from "../../../services/account.service.js"

export default [
    usernameExistsValidator(body("username")),
    body("method")
      .exists({checkFalsy: true}).withMessage(localize('validation.recovery.method.required')).bail()
      .escape()
      .isString()
      .isIn(['email','token']).withMessage(localize('validation.recovery.method.invalid')).bail(),
    body('email')
      .if(body('method')
        .equals('email'))
          .if(usernameExistsValidator(body("username")))
            .notEmpty().withMessage(localize('validation.recovery.email.selection_required')).bail()
            .escape()
            .isEmail().withMessage(localize('validation.recovery.email.format_invalid'))
            .custom(async (value,{req}) => {
              const account = await accountService.find.withUsername(req.body?.username)
              if(account && await accountService.recovery.email.check(account,value))
                return true
              else
                throw new Error(req.__('validation.recovery.email.incorrect'))
            }),
    body('token')
      .if(body('method')
        .equals('token'))
          .if(usernameExistsValidator(body("username")))
            .notEmpty().withMessage(localize('validation.recovery.token.selection_required')).bail()
            .escape()
            .custom((value) => isRecoveryToken(value)).withMessage(localize('validation.recovery.token.format_invalid'))
            .custom(async (value,{req}) => {
              const account = await accountService.find.withUsername(req.body?.username)
              if(account && await accountService.recovery.token.check(account,value))
                return true
              else
                throw new Error(req.__('validation.recovery.token.incorrect'))
            }),
  ]
