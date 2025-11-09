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
import localize from "../../localize.js";
import createPasswordValidator from "../../util-validators/create-password.validator.js";
import recoveryTokenValidator from "../../util-validators/recovery-token.validator.js";

export default [
  createPasswordValidator(body("password")),
  body('passwordConfirm')
    .exists({checkFalsy: true}).withMessage(localize('validation.password.confirmation_required')).bail()
    .custom((value, {req}) => value === req.body.password).withMessage(localize('validation.password.confirmation_mismatch')),
  body("recoveryMethod")
    .exists({checkFalsy: true}).withMessage(localize('validation.common.recovery_method.required')).bail()
    .escape()
    .isString()
    .isIn(['email','token']).withMessage(localize('validation.common.recovery_method.invalid')),     
  body('recoveryEmail')
    .if(body('recoveryMethod')
      .equals('email'))
        .notEmpty().withMessage(localize('validation.common.recovery_email.selection_required')).bail()
        .escape()
        .isEmail().withMessage(localize('validation.common.recovery_email.format_invalid')),
  recoveryTokenValidator(body('recoveryToken')
    .if(body('recoveryMethod')
      .equals('token'))),
  body("recoveryTokenVerify")
    .customSanitizer(input => {
      return Boolean(input)
    })
    .if(body('recoveryMethod')
      .equals('token'))
        .custom((value) => value == true).withMessage(localize("validation.common.recovery_token.confirmation_required")).bail()
]
