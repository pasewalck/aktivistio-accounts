import { param } from "express-validator";
import localize from "../../../../localize.js";
import accountService from "../../../../../services/account.service.js";

export default [
    param("id").exists({checkFalsy: true}).withMessage(localize('account.id.required')).bail()
        .escape()
        .isUUID().withMessage(localize('account.id.format_invalid')).bail()
        .custom((value,{req}) => {
            const account = accountService.find.withId(value)
            if(!account)
                throw new Error(req.__('account.id.not_found'))
            if(account.role >=  req.account.role)
                throw new Error(req.__('account.permission.insufficient'))
            return true
        }),
]
