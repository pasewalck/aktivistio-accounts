import { body } from "express-validator"

import { isRecoveryToken } from "../../../helpers/recovery-token-string.js"
import localize from "../../localize.js"
import usernameExistsValidator from "../../util-validators/username-exists.validator.js"
import accountService from "../../../services/account.service.js"

export default [
    usernameExistsValidator(body("username")),
    body("method")
      .exists({checkFalsy: true}).withMessage(localize('A recovery method must be defined.')).bail()
      .escape()
      .isString()
      .isIn(['email','token']).withMessage(localize('A valid recovery method must be defined.')).bail(),
    body('email')
      .if(body('method')
        .equals('email'))
          .if(usernameExistsValidator(body("username")))
            .notEmpty().withMessage(localize('A recovery email must be selected.')).bail()
            .escape()
            .isEmail().withMessage(localize('Email is not valid.'))
            .custom(async (value,{req}) => {
              const account = await accountService.find.withUsername(req.body?.username)
              if(account && await accountService.recovery.email.check(account,value))
                return true
              else
                throw new Error(req.__('Recovery email is incorrect.'))
            }),
    body('token')
      .if(body('method')
        .equals('token'))
          .if(usernameExistsValidator(body("username")))
            .notEmpty().withMessage(localize('A valid recovery token must be selected.')).bail()
            .escape()
            .custom((value) => isRecoveryToken(value)).withMessage(localize('Recovery token is not in valid format.'))
            .custom(async (value,{req}) => {
              const account = await accountService.find.withUsername(req.body?.username)
              if(account && await accountService.recovery.token.check(account,value))
                return true
              else
                throw new Error(req.__('Recovery token is incorrect.'))
            }),
  ]