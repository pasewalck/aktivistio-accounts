import { body } from "express-validator"

import localize from "../../localize.js";
import accountService from "../../../services/account.service.js";

export default [
    body("token")
      .notEmpty().withMessage(localize("two_factor.token.required"))
      .escape()
      .isInt().withMessage(localize("two_factor.token.format_invalid"))
      .custom((value,{req}) => accountService.twoFactorAuth.check(accountService.find.withId(req.session.twoFactorLogin?.accountId),value)).withMessage(localize("two_factor.token.verification_failed")),
    body("twoFactorLoginToken")
      .notEmpty().withMessage(localize("two_factor.login_token.required"))
      .escape()
      .custom((value, {req}) => req.session.twoFactorLogin?.loginToken == value),
  ]
