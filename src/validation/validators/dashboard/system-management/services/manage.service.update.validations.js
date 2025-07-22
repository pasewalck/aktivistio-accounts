import { body } from "express-validator";
import localize from "../../../../localize.js";
import currentUserPasswordValidator from "../../../../util-validators/current-user-password.validator.js";
import adapterService from "../../../../../services/adapter.service.js";

export default [
  currentUserPasswordValidator(body('adminPassword')),
  body("configuration")
    .exists({checkFalsy: true}).withMessage(localize('adapter.configuration.required')).bail()
    .isString().withMessage(localize('adapter.configuration.type_invalid')).bail()
    .custom(async (value,{req}) => {
      var json = JSON.parse(value)
      if(!json["client_id"])
        throw new Error(req.__("adapter.client.id_required"))
      if(adapterService.getEntry("Client",json["client_id"]) && req.params?.id != json["client_id"])
        throw new Error(req.__('adapter.client.id_conflict'))
      return true
    }),
]
