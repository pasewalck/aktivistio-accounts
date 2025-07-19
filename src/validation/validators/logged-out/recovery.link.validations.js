import { param } from "express-validator"

import localize from "../../localize.js"
import accountService from "../../../services/account.service.js"
import { ActionTokenTypes } from "../../../models/action-token-types.js"

export default [
  param("actionToken")
    .exists({checkFalsy: true}).withMessage(localize('A action Token is required.')).bail()
    .escape()
    .custom((value) => accountService.actionToken.checkValid(ActionTokenTypes.PASSWORD_RESET,value)).withMessage(localize('Action token is incorrect or expired.')),
  ]