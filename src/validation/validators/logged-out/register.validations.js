import { body, oneOf } from "express-validator"
import localize from "../../localize.js";
import createPasswordValidator from "../../util-validators/create-password.validator.js";
import recoveryTokenValidator from "../../util-validators/recovery-token.validator.js";
import invitesService from "../../../services/invites.service.js";
import accountService from "../../../services/account.service.js";
import usernameCreateValidator from "../../util-validators/username-create.validator.js";

export default [
  body("inviteCode")
    .exists({checkFalsy: true}).withMessage(localize('Invite code is not defined')).bail()
    .escape()
    .isAlphanumeric().withMessage(localize('Invite code format is invalid')).bail()
    .custom((value) => (!!invitesService.validate(value))).withMessage(localize('Invite code is invalid')),    
  usernameCreateValidator(body("username")),
  createPasswordValidator(body("password")),
  body('passwordConfirm')
    .exists({checkFalsy: true}).withMessage(localize('Password must be confirmed.')).bail()
    .escape()
    .custom((value, {req}) => value === req.body.password).withMessage(localize('You confirm password does not match.')),
  body("recoveryMethod")
    .exists({checkFalsy: true}).withMessage(localize('A recovery method must be defined.')).bail()
    .escape()
    .isString()
    .isIn(['email','token']).withMessage(localize('A valid recovery method must be defined.')),     
  body('recoveryEmail')
    .if(body('recoveryMethod')
      .equals('email'))
        .notEmpty().withMessage(localize('A recovery email must be selected.')).bail()
        .escape()
        .isEmail().withMessage(localize('Email is not valid.')),
  recoveryTokenValidator(body('recoveryToken')
    .if(body('recoveryMethod')
      .equals('token'))),
  body("recoveryTokenVerify")
    .customSanitizer(input => {
      return Boolean(input)
    })
    .if(body('recoveryMethod')
      .equals('token'))
        .custom((value) => value == true).withMessage(localize("Recovery must be confirmed")).bail()
]