import { body } from "express-validator";
import localize from "../../../../localize.js";
import { Role } from "../../../../../models/roles.js";
import usernameCreateValidator from "../../../../util-validators/username-create.validator.js";

export default [
    body('email').notEmpty().withMessage(localize('email.required')).bail().escape().isEmail().withMessage(localize('email.format.invalid'))
]
