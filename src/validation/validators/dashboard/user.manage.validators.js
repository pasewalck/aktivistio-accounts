import { param } from "express-validator";
import localize from "../../localize.js";
import accountDriver from "../../../drivers/account.driver.js";

export default [
    param("id").exists({checkFalsy: true}).withMessage(localize('User id is not defined')).bail()
        .escape()
        .isUUID().withMessage(localize('User Id must be in UUID Format')).bail()
        .custom((value) => (!!accountDriver.findAccountWithId(value))).withMessage(localize('No user for user id')),
]
