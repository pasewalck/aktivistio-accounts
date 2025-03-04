import { param } from "express-validator";
import localize from "../../../../localize.js";
import accountService from "../../../../../services/account.service.js";

export default [
    param("id").exists({checkFalsy: true}).withMessage(localize('User id is not defined')).bail()
        .escape()
        .isUUID().withMessage(localize('User Id must be in UUID Format')).bail()
        .custom((value,{req}) => {
            const account = accountService.find.withId(value)
            if(!account)
                throw new Error(req.__('No user for user id'))
            if(account.role >=  req.account.role)
                throw new Error(req.__('Missing permission to manage that account'))
            return true
        }),
]
