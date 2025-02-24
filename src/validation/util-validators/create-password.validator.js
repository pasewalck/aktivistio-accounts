import localize from "../localize.js";

/**
 * @param {import("express-validator").ValidationChain} [validationChain]
 * @returns {import("express-validator").ValidationChain}
 */
export default (validationChain) => {
    return validationChain
        .exists({checkFalsy: true}).bail()
        .escape()
        .isString()
        .isAscii().withMessage(localize("Password contains invalid characters")).bail()
        .custom((value,{req}) => {
            let passwordStrg = zxcvbn(value);
            if (passwordStrg.score <= 2)
            {
                var messages = [];
                messages.push(`${req.__(passwordStrg.feedback.warning)}.`)
                passwordStrg.feedback.suggestions.forEach(suggestion => {
                    messages.push(req.__(suggestion))
                });
                throw new Error(messages.join(" "))
            }
                  
            return true;
        })
} 