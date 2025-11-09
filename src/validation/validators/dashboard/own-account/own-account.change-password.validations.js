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

import localize from "../../../localize.js";
import createPasswordValidator from "../../../util-validators/create-password.validator.js";
import currentUserPasswordValidatorCopy from "../../../util-validators/current-user-password.validator.js";

export default [
    currentUserPasswordValidatorCopy(body('currentPassword')),
    createPasswordValidator(body('newPassword')),
    body('confirmNewPassword')
      .exists({checkFalsy: true}).withMessage(localize('password.confirm.required')).bail()
      .custom((value, {req}) => value === req.body.newPassword).withMessage(localize('password.confirm.mismatch')),
    
  ]
