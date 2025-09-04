import { body } from "express-validator";
import localize from "../../../../localize.js";
import { Role } from "../../../../../models/roles.js";

export default [
    body("accountUpdateRole")
      .exists({checkFalsy: true}).withMessage(localize('validation_feedback.role_required')).bail()
      .escape()
      .isString()
      .isIn(Role.all()).withMessage(localize('validation_feedback.role_invalid')).bail()
      .custom((value,{req}) => value < req.account.role).withMessage(localize('validation_feedback.permission_denied_for_role')).bail(),
]
