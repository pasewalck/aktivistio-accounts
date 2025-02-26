import { body, oneOf } from "express-validator"
import { isRecoveryToken } from "../../../helpers/recovery-token-string.js"
import accountDriver from "../../../drivers/account.driver.js"
import zxcvbn from "zxcvbn";
import localize from "../../localize.js";
import createPasswordValidator from "../../util-validators/create-password.validator.js";
import recoveryTokenValidator from "../../util-validators/recovery-token.validator.js";

export default [
  body("verify")
    .customSanitizer(input => {
      return Boolean(input)
    })
    .custom((value) => value == true).withMessage("Consent must be confirmed").bail(),
]