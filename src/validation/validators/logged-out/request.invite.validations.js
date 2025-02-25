import { body, oneOf } from "express-validator"
import { isRecoveryToken } from "../../../helpers/recovery-token-string.js"
import accountDriver from "../../../drivers/account.driver.js"
import zxcvbn from "zxcvbn";
import config from "../../../config.js";

export default [
    body("email")
      .notEmpty().withMessage("Email must be defined")
      .escape()
      .isEmail().withMessage("Email must be a valid email").bail()
      .isEmail({host_whitelist:config.invitingMailProviders}).withMessage("Email provider is not whitelisted")
      .custom(async (value) => (await accountDriver.requestInvite(email) != null)).withMessage("Email address already used for creating account"),
  ]