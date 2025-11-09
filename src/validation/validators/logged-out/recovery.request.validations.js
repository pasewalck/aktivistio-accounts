/* 
 * This file is part of "Aktivistio Accounts".
 *
 * The project "Aktivistio Accounts" implements an account system and 
 * management platform combined with an OAuth 2.0 Authorization Server.
 *
 * "Aktivistio Accounts" is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * "Aktivistio Accounts" is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with "Aktivistio Accounts". If not, see https://www.gnu.org/licenses/.
 *
 * Copyright (C) 2025 Jana Caroline Pasewalck
 */
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
              if(account && await accountService.recovery.email.check(account,value))
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
              if(account && await accountService.recovery.token.check(account,value))
                return true
              else
                throw new Error(req.__('validation.common.recovery_token.incorrect'))
            }),
  ]
