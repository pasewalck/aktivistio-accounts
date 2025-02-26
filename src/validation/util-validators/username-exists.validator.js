import accountDriver from "../../drivers/account.driver.js"
import localize from "../localize.js"

/**
 * @param {import("express-validator").ValidationChain} [validationChain]
 * @returns {import("express-validator").ValidationChain}
 */
export default (validationChain) => {
    return validationChain
        .exists({checkFalsy: true})
        .escape()
        .toLowerCase()
        .isAlphanumeric().withMessage(localize('Username is in invalid format')).bail()
        .custom((value) => (accountDriver.findAccountWithUsername(value))).withMessage(localize("No Account for username can be found"))
} 