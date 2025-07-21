import { param } from "express-validator"

import localize from "../../localize.js"
import accountService from "../../../services/account.service.js"
import { ActionTokenTypes } from "../../../models/action-token-types.js"

export default [
  param("actionToken")
    .exists({checkFalsy: true}).withMessage(localize('An action Token is required.')).bail()
    .escape()
    .custom((value) => accountService.actionToken.checkValid(ActionTokenTypes.ACCOUNT_SETUP,value)).withMessage(localize('Action token is incorrect or expired.')),
  ]