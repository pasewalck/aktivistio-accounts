import { body } from "express-validator"
import accountDriver from "../../../drivers/account.driver.js"
import localize from "../../localize.js"

export default [
    body("username")
      .exists({checkFalsy: true})
      .escape()
      .toLowerCase()
      .custom((value) => (accountDriver.findAccountWithUsername(value))).withMessage(localize("No Account for username can be found")),
    body("password")
      .exists({checkFalsy: true})
      .escape()
      .if(body('username')
        .escape()
        .toLowerCase()
        .custom((value) => (accountDriver.findAccountWithUsername(value))))
          .custom(async (value,{req}) => {
            if (await accountDriver.checkLogin(req.body.username,value))
              return true;
            else
              throw Error("dd")
          }).withMessage(localize("Password is incorrect")),
  ]