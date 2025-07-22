import { body } from "express-validator";
import localize from "../../../../localize.js";
import { Role } from "../../../../../models/roles.js";

export default [
    body("accountUpdateRole")
      .exists({checkFalsy: true}).withMessage(localize('account.role.required')).bail()
      .escape()
      .isString()
      .isIn(Role.all()).withMessage(localize('account.role.invalid')).bail()
      .custom((value,{req}) => value < req.account.role).withMessage(localize('account.role.permission_denied')).bail(),
]
