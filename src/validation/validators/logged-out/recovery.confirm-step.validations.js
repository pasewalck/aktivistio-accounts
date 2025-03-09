import { body } from "express-validator"

import localize from "../../localize.js"

export default [
  body("confirmCode")
    .exists({checkFalsy: true}).withMessage(localize('A code is required.')).bail()
    .escape()
    .isInt().withMessage(localize('Confirm code needs to be an integer'))
    .toInt()
    .custom((value,{req}) => value == req.session?.accountRecovery?.confirmCode).withMessage(localize('Confirm code is incorrect')),
  ]