import { body, oneOf } from "express-validator"
import localize from "../../localize.js";
import createPasswordValidator from "../../util-validators/create-password.validator.js";
import recoveryTokenValidator from "../../util-validators/recovery-token.validator.js";
import invitesService from "../../../services/invites.service.js";
import accountService from "../../../services/account.service.js";
import bruteProtectionServices from "../../../services/brute-protection.services.js";

export default [
  body("inviteCode")
    .exists({checkFalsy: true}).withMessage(localize('Invite code is not defined')).bail()
    .escape()
    .isAlphanumeric().withMessage(localize('Invite code format is invalid')).bail()
    .custom(async (value,{req}) => {
      const bruteResult = await bruteProtectionServices.check(req,"registerAccount",req.body.username)
      if(bruteResult.blocked)
        throw Error(req.__(`Too many attempts. You will need to wait %s seconds.`,bruteResult.waitTime))
    
      if (invitesService.validate(value))
        return true;
                
      await bruteProtectionServices.addFail(req,"registerAccount",req.body.username)
      throw Error(req.__("Invite code is invalid"))
    }),
  body("username")
    .exists({checkFalsy: true}).bail()
    .isString()
    .escape()
    .isLowercase().withMessage(localize("Usernames are not allowed to use upercase letters"))
    .isAlphanumeric().withMessage(localize("Usernames are only allowed to use numbers and letters"))
    .isLength({ min: 2,max:14 }).withMessage(localize("Username must be between 2 and 14 characters"))
    .custom((value) => !(!!accountService.find.withUsername(value))).withMessage(localize("Username is taken")),
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
        .custom((value) => value == true).withMessage("Recovery must be confirmed").bail()
]