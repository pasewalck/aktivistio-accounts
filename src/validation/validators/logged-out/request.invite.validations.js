import { body } from "express-validator"
import invitesService from "../../../services/invites.service.js";
import env from "../../../helpers/env.js";
import localize from "../../localize.js";

export default [
    body("email")
      .notEmpty().withMessage(localize("Email must be defined."))
      .escape()
      .isEmail().withMessage(localize("Email must be a valid email.")).bail()
      .isEmail({host_whitelist:env.WHITELISTED_MAIL_PROVIDERS}).withMessage(localize("Email provider is not whitelisted."))
      .custom(async (value,{req}) => {
        if(await invitesService.requestWithEmail(value) === false)
          throw new Error(req.__("Email address already used for creating account."))
      }),
  ]