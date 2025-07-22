import { body } from "express-validator";
import localize from "../../../localize.js";

export default [
    body('count')
        .exists().withMessage(localize('validation.count.required'))
        .isInt({ gt: 0, max: 1000 }).withMessage(localize('validation.count.range', 1000))
        .toInt(),
    body('date')
        .optional({checkFalsy:true})
        .isDate().withMessage(localize('validation.date.invalid'))
        .toDate()
];
