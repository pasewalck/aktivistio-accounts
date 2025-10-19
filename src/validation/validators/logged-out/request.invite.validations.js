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
import invitesService from "../../../services/invites.service.js";
import env from "../../../helpers/env.js";
import localize from "../../localize.js";

export default [
    body("email")
      .notEmpty().withMessage(localize("validation.email.required"))
      .escape()
      .isEmail().withMessage(localize("validation.email.format_invalid")).bail()
      .isEmail({host_whitelist:env.WHITELISTED_MAIL_PROVIDERS}).withMessage(localize("validation.email.provider_not_whitelisted"))
      .custom(async (value,{req}) => {
        if(await invitesService.requestWithEmail(value) === false)
          throw new Error(req.__("validation.email.already_used"))
      }),
  ]
