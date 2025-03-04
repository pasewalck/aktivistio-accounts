import { body } from "express-validator";
import localize from "../../../../localize.js";
import { Role } from "../../../../../models/roles.js";

export default [
    body("accountUpdateRole")
      .exists({checkFalsy: true}).withMessage(localize('A new account role must be selected')).bail()
      .escape()
      .isString()
      .isIn(Role.all()).withMessage(localize('A valid role be defined.')).bail()
      .custom((value,{req}) => value < req.account.role).withMessage(localize('User can not be granted a higher role than admin granting it.')).bail(),
]