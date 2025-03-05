import { param } from "express-validator";
import localize from "../../../../localize.js";
import adapterService from "../../../../../services/adapter.service.js";

export default [
    param("id").exists({checkFalsy: true}).withMessage(localize('Specified ID missing')).bail()
        .escape()
        .isString().withMessage(localize('Invalid ID specified')).bail()
        .custom(async (value,{req}) => {
            if(!adapterService.getEntry("Client",value))
                throw new Error(req.__('Not Client found for specified ID'))
            return true
        }),
]
