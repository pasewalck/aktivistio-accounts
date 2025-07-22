import { param } from "express-validator"

import localize from "../../localize.js"
import accountService from "../../../services/account.service.js"
import { ActionTokenTypes } from "../../../models/action-token-types.js"

export default [
  param("actionToken")
    .exists({checkFalsy: true}).withMessage(localize('validation.action_token.required')).bail()
    .escape()
    .custom((value) => accountService.actionToken.checkValid(ActionTokenTypes.PASSWORD_RESET,value))
    .withMessage(localize('validation.action_token.invalid')),
]
