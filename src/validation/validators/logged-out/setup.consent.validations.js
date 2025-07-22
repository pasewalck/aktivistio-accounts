import { body } from "express-validator"
import localize from "../../localize.js"

export default [
  body("verify")
    .customSanitizer(input => {
      return Boolean(input)
    })
    .custom((value) => value == true).withMessage(localize("validation.consent.required")).bail(),
]
