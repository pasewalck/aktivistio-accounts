import { body } from "express-validator"
import usernameExistsValidator from "../../util-validators/username-exists.validator.js";
import accountService from "../../../services/account.service.js";
import bruteProtectionServices from "../../../services/brute-protection.services.js";

export default [
    usernameExistsValidator(body("username")),
    body("password")
      .exists({checkFalsy: true})
      .if(body('username')
        .toLowerCase()
        .custom((value) => (accountService.find.withUsername(value))))
          .custom(async (value,{req}) => {
            
            const bruteResult = await bruteProtectionServices.check(req,"loginAccount",req.body.username)
            if(bruteResult.blocked)
              throw Error(req.__(`Too many attempts. You will need to wait %s seconds.`,bruteResult.waitTime))

            if (await accountService.checkLogin(req.body.username,value))
              return true;
            
            await bruteProtectionServices.addFail(req,"loginAccount",req.body.username)
            throw Error(req.__("Password is incorrect."))
            
          }),
  ]