
import { body } from "express-validator";
import localize from "../../../../localize.js";

export default [
    body('email').notEmpty().withMessage(localize('email.body.required')).bail().escape().isEmail().withMessage(localize('email.body.format.invalid'))
]
