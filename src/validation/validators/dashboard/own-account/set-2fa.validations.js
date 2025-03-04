import { body } from "express-validator"
import twoFactorAuth from "../../../../helpers/two-factor-auth.js"
import localize from "../../../localize.js"

export default [
    body("secret")
        .notEmpty().withMessage(localize("Secret must be defined"))
        .escape()
        .isBase32().withMessage(localize("Secret must be in base32 format")),
    body("token")
      .notEmpty().withMessage(localize("Token must be defined"))
      .escape()
      .isInt().withMessage(localize("Token must be valid format"))
      .custom((value, {req}) => twoFactorAuth.verify(req.body.secret,value)).withMessage(localize('Token appears to be incorret')),
]
