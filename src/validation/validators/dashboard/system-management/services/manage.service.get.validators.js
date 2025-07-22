import { param } from "express-validator";
import localize from "../../../../localize.js";
import adapterService from "../../../../../services/adapter.service.js";

export default [
    param("id").exists({checkFalsy: true}).withMessage(localize('adapter.id.required')).bail()
        .escape()
        .isString().withMessage(localize('adapter.id.invalid')).bail()
        .custom(async (value,{req}) => {
            if(!adapterService.getEntry("Client",value))
                throw new Error(req.__('adapter.client.not_found'))
            return true
        }),
]
