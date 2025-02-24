import localize from "../localize.js"

/**
 * @param {import("express-validator").ValidationChain} [validationChain]
 * @returns {import("express-validator").ValidationChain}
 */
export default (validationChain) => {
    return validationChain
        .exists({ checkFalsy: true }).bail().withMessage(localize('Password is required.'))
        .escape()
        .custom((value,{req}) => {
            return accountDriver.checkPassword(req.account.id,value)
        }).withMessage(localize('Password is incorrent.'))
} 