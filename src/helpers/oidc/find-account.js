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
 * along with "Aktivistio Accounts". If not, see <https://www.gnu.org/licenses/>.
 *
 * Copyright (C) 2025 Jana
 */
import accountService from "../../services/account.service.js";

export default async function findAccount(ctx, id) {
    const account = accountService.find.withId(id);
    return (
        {
          accountId: id,
          claims(use, scope) {
  
            const openid = { sub: id };
            const email = {
              email: account.username + "@placeholder.mail",          
            };
            const profile = {
              name: account.username,
            };
  
            return {
              ...(scope.includes("openid") && openid),
              ...(scope.includes("email") && email),
              ...(scope.includes("profile") && profile),
            };
          },
        }
      );
}
