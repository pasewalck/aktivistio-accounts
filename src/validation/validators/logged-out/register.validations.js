import { body } from "express-validator"
import localize from "../../localize.js";
import createPasswordValidator from "../../util-validators/create-password.validator.js";
import invitesService from "../../../services/invites.service.js";
import usernameCreateValidator from "../../util-validators/username-create.validator.js";
import setupValidations from "./setup.validations.js";

export default [
  body("inviteCode")
    .exists({checkFalsy: true}).withMessage(localize('validation.invite.code.required')).bail()
    .escape()
    .isAlphanumeric().withMessage(localize('validation.invite.code.format_invalid')).bail()
    .custom((value) => (!!invitesService.validate(value))).withMessage(localize('validation.invite.code.invalid')),    
  usernameCreateValidator(body("username")),
  createPasswordValidator(body("password")),
  ...setupValidations
]
