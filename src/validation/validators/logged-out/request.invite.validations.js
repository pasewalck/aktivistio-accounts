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
