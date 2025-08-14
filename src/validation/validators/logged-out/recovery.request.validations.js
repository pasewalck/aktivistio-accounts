import { body } from "express-validator"

import { isRecoveryToken } from "../../../helpers/recovery-token-string.js"
import localize from "../../localize.js"
import usernameExistsValidator from "../../util-validators/username-exists.validator.js"
import accountService from "../../../services/account.service.js"

export default [
    usernameExistsValidator(body("username")),
    body("method")
      .exists({checkFalsy: true}).withMessage(localize('validation.common.recovery_method.required')).bail()
      .escape()
      .isString()
      .isIn(['email','token']).withMessage(localize('validation.common.recovery_method.invalid')).bail(),
    body('email')
      .if(body('method')
        .equals('email'))
          .if(usernameExistsValidator(body("username")))
            .notEmpty().withMessage(localize('validation.common.recovery_email.selection_required')).bail()
            .escape()
            .isEmail().withMessage(localize('validation.common.recovery_email.format_invalid'))
            .custom(async (value,{req}) => {
              const account = await accountService.find.withUsername(req.body?.username)
              if(account && await accountService.common.recovery_email.check(account,value))
                return true
              else
                throw new Error(req.__('validation.common.recovery_email.incorrect'))
            }),
    body('token')
      .if(body('method')
        .equals('token'))
          .if(usernameExistsValidator(body("username")))
            .notEmpty().withMessage(localize('validation.common.recovery_token.selection_required')).bail()
            .escape()
            .custom((value) => isRecoveryToken(value)).withMessage(localize('validation.common.recovery_token.format_invalid'))
            .custom(async (value,{req}) => {
              const account = await accountService.find.withUsername(req.body?.username)
              if(account && await accountService.common.recovery_token.check(account,value))
                return true
              else
                throw new Error(req.__('validation.common.recovery_token.incorrect'))
            }),
  ]
