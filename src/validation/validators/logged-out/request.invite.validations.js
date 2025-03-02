import { body } from "express-validator"
import config from "../../../config.js";
import invitesService from "../../../services/invites.service.js";

export default [
    body("email")
      .notEmpty().withMessage("Email must be defined")
      .escape()
      .isEmail().withMessage("Email must be a valid email").bail()
      .isEmail({host_whitelist:config.invitingMailProviders}).withMessage("Email provider is not whitelisted")
      .custom(async (value) => (await invitesService.requestWithEmail(value) != null)).withMessage("Email address already used for creating account"),
  ]