import { body, oneOf } from "express-validator"
import { isRecoveryToken } from "../../../helpers/recovery-token-string.js"
import accountDriver from "../../../drivers/account.driver.js"
import zxcvbn from "zxcvbn";

export default [
    body("count")
      .exists({checkFalsy: true})
      .escape()
      .isInt()
      .toInt(),
    body("expire")
      .exists({checkFalsy: true})
      .escape()
  ]