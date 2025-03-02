import { body } from "express-validator"

export default [
  body("verify")
    .customSanitizer(input => {
      return Boolean(input)
    })
    .custom((value) => value == true).withMessage("Consent must be confirmed").bail(),
]