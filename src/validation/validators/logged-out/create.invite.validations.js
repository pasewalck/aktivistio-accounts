import { body, oneOf } from "express-validator"

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