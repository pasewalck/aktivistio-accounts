import { body } from "express-validator"
import localize from "../../localize"

export default [
  body("verify")
    .customSanitizer(input => {
      return Boolean(input)
    })
    .custom((value) => value == true).withMessage(localize("Consent must be confirmed")).bail(),
]