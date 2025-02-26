import { isRecoveryToken } from "../../helpers/recovery-token-string.js"
import localize from "../localize.js"

/**
 * @param {import("express-validator").ValidationChain} [validationChain]
 * @returns {import("express-validator").ValidationChain}
 */
export default (validationChain) => {
    return validationChain.notEmpty().withMessage(localize('A valid recovery token must be selected.')).bail()
    .custom((value) => isRecoveryToken(value)).withMessage(localize('Recovery token is not in valid format'))     
}