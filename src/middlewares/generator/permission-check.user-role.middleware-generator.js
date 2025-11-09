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
import { hasPermission, Permission } from "../../models/roles.js";

/**
 * @description Generate middleware to check for a specific permission
 * @param {Permission} [permission] - The permission to check for
 * @returns {function} Middleware function
 */
export function generateCheckUserPermission(permission) {

  if (!permission) {
    return res.status(400).json({ error: "Permission not specified" });
  }

  /**
   * @description Middleware to check user permissions
   * @param {import("express").Request} req - The request object
   * @param {import("express").Response} res - The response object
   * @param {import("express").NextFunction} next - The next middleware function
   */
  return (req, res, next) => {

    if (!hasPermission(req.account.role, permission)) {
      return res.status(403).json({ error: "Missing permissions for this action" });
    }

    next();
  };
}
