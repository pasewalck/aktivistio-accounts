import { isRecoveryToken } from "../../helpers/recovery-token-string.js"
import localize from "../localize.js"

/**
 * @param {import("express-validator").ValidationChain} [validationChain]
 * @returns {import("express-validator").ValidationChain}
 */
export default (validationChain) => {
    return validationChain
        .notEmpty().withMessage(localize('validation.recovery-token.required')).bail()
        .custom((value) => isRecoveryToken(value)).withMessage(localize('validation.recovery-token.invalid-format'))     
}
