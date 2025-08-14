import { body } from "express-validator";
import localize from "../../../../localize.js";

export default [
    body('email').notEmpty().withMessage(localize('email.required')).bail().escape().isEmail().withMessage(localize('email.format.invalid'))
]
