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
import usernameExistsValidator from "../../util-validators/username-exists.validator.js";
import accountService from "../../../services/account.service.js";

export default [
    usernameExistsValidator(body("username")),
    body("password")
      .exists({checkFalsy: true})
      .if(body('username')
        .toLowerCase()
        .custom((value) => (accountService.find.withUsername(value))))
          .custom(async (value,{req}) => {
            if (await accountService.checkLogin(req.body.username,value))
              return true;
            else
              throw Error(req.__("validation.login.password_incorrect"))
          }),
  ]
