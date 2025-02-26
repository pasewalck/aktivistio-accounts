import { body } from "express-validator"
import accountDriver from "../../../drivers/account.driver.js"
import localize from "../../localize.js"
import usernameExistsValidator from "../../util-validators/username-exists.validator.js";

export default [
    usernameExistsValidator(body("username")),
    body("password")
      .exists({checkFalsy: true})
      .escape()
      .if(body('username')
        .escape()
        .toLowerCase()
        .custom((value,{req}) => (accountDriver.findAccountWithUsername(value))))
          .custom(async (value,{req}) => {
            if (await accountDriver.checkLogin(req.body.username,value))
              return true;
            else
              throw Error(req.__("Password is incorrect"))
          }),
  ]