import accountService from "../../services/account.service.js"
import localize from "../localize.js"

/**
 * @param {import("express-validator").ValidationChain} [validationChain]
 * @returns {import("express-validator").ValidationChain}
 */
export default (validationChain) => {
    return validationChain
        .exists({checkFalsy: true}).bail()
        .isString()
        .escape()
        .isLowercase().withMessage(localize("validation.username.only_lowercases"))
        .isAlphanumeric().withMessage(localize("validation.username.characters_allowed"))
        .isLength({ min: 2,max:14 }).withMessage(localize("validation.username.length"))
        .custom((value) => !(!!accountService.find.withUsername(value))).withMessage(localize("validation.username.taken"))
}