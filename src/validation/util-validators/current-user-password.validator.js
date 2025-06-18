import accountService from "../../services/account.service.js";
import localize from "../localize.js"

/**
 * @param {import("express-validator").ValidationChain} [validationChain]
 * @returns {import("express-validator").ValidationChain}
 */
export default (validationChain) => {
    return validationChain
        .exists({ checkFalsy: true }).bail().withMessage(localize('Password is required.'))
        .custom(async (value,{req}) => {
            if(await accountService.password.check(req.account,value))
                return true
            else
                throw new InternalError(req.__('Password is incorrent.'));
        })
} 