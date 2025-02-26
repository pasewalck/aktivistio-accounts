import accountDriver from "../../drivers/account.driver.js"
import localize from "../localize.js"

/**
 * @param {import("express-validator").ValidationChain} [validationChain]
 * @returns {import("express-validator").ValidationChain}
 */
export default (validationChain) => {
    return validationChain
        .exists({ checkFalsy: true }).bail().withMessage(localize('Password is required.'))
        .custom(async (value,{req}) => {
            if(await accountDriver.checkPassword(req.account.id,value))
                return true
            else
                throw new Error(req.__('Password is incorrent.'));
        })
} 