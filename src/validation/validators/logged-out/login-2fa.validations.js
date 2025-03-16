import { body } from "express-validator"

import localize from "../../localize.js";
import accountService from "../../../services/account.service.js";

export default [
    body("token")
      .notEmpty().withMessage(localize("Token must be defined"))
      .escape()
      .isInt().withMessage(localize("Token must be valid format"))
      .custom((value,{req}) => accountService.twoFactorAuth.check(accountService.find.withId(req.session.twoFactorLogin?.accountId),value)).withMessage(localize("Token is incorrent.")),
    body("twoFactorLoginToken")
      .notEmpty().withMessage(localize("Two factor login token missing"))
      .escape()
      .custom((value, {req}) => req.session.twoFactorLogin?.loginToken == value),
  ]