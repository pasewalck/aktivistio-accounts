import { body } from "express-validator";
import localize from "../../../../localize.js";
import currentUserPasswordValidator from "../../../../util-validators/current-user-password.validator.js";
import adapterService from "../../../../../services/adapter.service.js";

export default [
  currentUserPasswordValidator(body('adminPassword')),
  body("configuration")
    .exists({checkFalsy: true}).withMessage(localize('A configuration must be setup')).bail()
    .isString().withMessage(localize('A configuration must be a string')).bail()
    .custom(async (value) => {
      var json = JSON.parse(value)
      if(!json["client_id"])
        throw new Error(req.__("Client ID ('client_id') must be specifier"))
      if(adapterService.getEntry("Client",json["client_id"]))
        throw new Error(req.__('Client ID already is use!'))
      return true
    }),
]