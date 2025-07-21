import { body } from "express-validator"
import localize from "../../localize.js";
import createPasswordValidator from "../../util-validators/create-password.validator.js";
import invitesService from "../../../services/invites.service.js";
import usernameCreateValidator from "../../util-validators/username-create.validator.js";
import setupValidations from "./setup.validations.js";

export default [
  body("inviteCode")
    .exists({checkFalsy: true}).withMessage(localize('Invite code is not defined')).bail()
    .escape()
    .isAlphanumeric().withMessage(localize('Invite code format is invalid')).bail()
    .custom((value) => (!!invitesService.validate(value))).withMessage(localize('Invite code is invalid')),    
  usernameCreateValidator(body("username")),
  createPasswordValidator(body("password")),
  ...setupValidations
]