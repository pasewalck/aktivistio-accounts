import zxcvbn from "zxcvbn";
import localize from "../localize.js";

/**
 * @param {import("express-validator").ValidationChain} [validationChain]
 * @returns {import("express-validator").ValidationChain}
 */
export default (validationChain) => {
    return validationChain
        .exists({checkFalsy: true}).bail()
        .isString()
        .isAscii().withMessage(localize("validation.password.invalid_characters")).bail()
        .custom((value,{req}) => {
            let passwordStrg = zxcvbn(value);
            if (passwordStrg.score <= 2)
            {
                var messages = [];
                if(passwordStrg.feedback.warning)
                    messages.push(`${req.__(passwordStrg.feedback.warning.toLowerCase().replaceAll(" ","_").replaceAll(".",""))}.`)
                else
                    messages.push(req.__("validation.password.security"))

                passwordStrg.feedback.suggestions.forEach(suggestion => {
                    messages.push(req.__(suggestion.toLowerCase().replaceAll(" ","_").replaceAll(".","")))
                });
                throw new Error(messages.join(" "))
            }
                  
            return true;
        })
} 