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
 * Copyright (C) 2025 Jana
 */
import { body } from "express-validator"
import usernameCreateValidator from "../../util-validators/username-create.validator.js";
import detailsValidations from "./setup.details.validations.js";
import accountService from "../../../services/account.service.js";
import { ActionTokenTypes } from "../../../models/action-token-types.js";

export default [
  usernameCreateValidator(body("username"),(req) => {
      const actionTokenEntry = accountService.actionToken.getEntry(ActionTokenTypes.ACCOUNT_SETUP,req.params.actionToken)

      if(actionTokenEntry)
      {
        const account = accountService.find.withId(actionTokenEntry.payload.accountId);

        return account ? account.username : null
      }
      else {
        return null
      }
  }),
  ...detailsValidations
]
