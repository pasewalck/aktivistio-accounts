import { body } from "express-validator";
import localize from "../../../../localize.js";
import { Role } from "../../../../../models/roles.js";
import usernameCreateValidator from "../../../../util-validators/username-create.validator.js";

export default [
    usernameCreateValidator(body("username")),
    body("role")
      .exists({checkFalsy: true}).withMessage(localize('validation_feedback.role_required')).bail()
      .escape()
      .isString()
      .isIn(Role.all()).withMessage(localize('validation_feedback.role_invalid')).bail()
      .custom((value,{req}) => value < req.account.role).withMessage(localize('validation_feedback.permission_denied_for_role')).bail(),
]
