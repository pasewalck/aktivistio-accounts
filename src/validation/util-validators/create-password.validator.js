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
import zxcvbn from "zxcvbn";
import localize from "../localize.js";

/**
 * @param {import("express-validator").ValidationChain} [validationChain]
 * @returns {import("express-validator").ValidationChain}
 */
export default (validationChain) => {
    return validationChain
        .exists({checkFalsy: true}).bail()
        .isString()
        .isAscii().withMessage(localize("validation.password.invalid_characters")).bail()
        .custom((value,{req}) => {
            let passwordStrg = zxcvbn(value);
            if (passwordStrg.score <= 2)
            {
                var messages = [];
                if(passwordStrg.feedback.warning)
                    messages.push(`${req.__(passwordStrg.feedback.warning.toLowerCase().replaceAll(" ","_").replaceAll(".",""))}.`)
                else
                    messages.push(req.__("validation.password.security"))

                passwordStrg.feedback.suggestions.forEach(suggestion => {
                    messages.push(req.__(suggestion.toLowerCase().replaceAll(" ","_").replaceAll(".","")))
                });
                throw new Error(messages.join(" "))
            }
                  
            return true;
        })
} 
