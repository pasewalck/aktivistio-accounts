import { body } from "express-validator"
import usernameCreateValidator from "../../util-validators/username-create.validator.js";
import detailsValidations from "./setup.details.validations.js";
import accountService from "../../../services/account.service.js";
import { ActionTokenTypes } from "../../../models/action-token-types.js";

export default [
  usernameCreateValidator(body("username"),(req) => {
      const actionTokenEntry = accountService.actionToken.getEntry(ActionTokenTypes.ACCOUNT_SETUP,req.params.actionToken)

      if(actionTokenEntry)
      {
        const account = accountService.find.withId(actionTokenEntry.payload.accountId);

        return account ? account.username : null
      }
      else {
        return null
      }
  }),
  ...detailsValidations
]
