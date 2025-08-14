import accountService from "../../services/account.service.js"
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
        .custom((value) => (accountService.find.withUsername(value)))
            .withMessage(localize("validation.username.not-found"))
} 
