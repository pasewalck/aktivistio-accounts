import { body } from "express-validator"
import usernameExistsValidator from "../../util-validators/username-exists.validator.js";
import accountService from "../../../services/account.service.js";

export default [
    usernameExistsValidator(body("username")),
    body("password")
      .exists({checkFalsy: true})
      .if(body('username')
        .toLowerCase()
        .custom((value) => (accountService.find.withUsername(value))))
          .custom(async (value,{req}) => {
            if (await accountService.checkLogin(req.body.username,value))
              return true;
            else
              throw Error(req.__("Password is incorrect"))
          }),
  ]