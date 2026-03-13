
import { body } from "express-validator"
import twoFactorAuth from "../../../../helpers/two-factor-auth.js"
import localize from "../../../localize.js"

export default [
    body("secret")
        .notEmpty().withMessage(localize("validation.two_factor.secret.required"))
        .escape(),
    body("token")
        .notEmpty().withMessage(localize("validation.two_factor.token.required"))
        .escape()
        .isInt().withMessage(localize("validation.two_factor.token.format_invalid"))
        .custom((value, { req }) => twoFactorAuth.verify(req.body.secret, value)).withMessage(localize('validation.two_factor.token.verification_failed')),
]
