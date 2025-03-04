import { body } from "express-validator";
import localize from "../../../localize.js";

export default [
    body('count')
        .exists().withMessage(localize('Missing fields or invalid'))
        .isInt({ gt: 0, max: 1000 }).withMessage(localize('Count must be an intager between 0 and %s',1000))
        .toInt(),
    body('date')
        .optional({checkFalsy:true})
        .custom((value) => console.log(value))
        .isDate().withMessage(localize('Invalid date format'))
        .toDate()
];