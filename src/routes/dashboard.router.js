import {setNoCache} from '../middlewares/set-no-cache.middleware.js'
import {userAuthMiddleware} from '../middlewares/user-auth.middleware.js';
import { generateCheckUserPersmission } from '../middlewares/generator/permission-check.user-role.middleware-generator.js';

import changePasswordValidationsCopy from '../validation/validators/dashboard/change-password.validations.js';
import set2faValidations from '../validation/validators/dashboard/set-2fa.validations.js';
import setRecoveryTokenValidations from '../validation/validators/dashboard/set-recovery-token.validations.js';
import setRecoveryEmailValidations from '../validation/validators/dashboard/set-recovery-email.validations.js';
import deleteRecoveryMethodValidations from '../validation/validators/dashboard/delete.recovery-method.validations.js';
import deleteAccountValidations from '../validation/validators/dashboard/delete-account.validations.js';
import deleteInviteValidators from '../validation/validators/dashboard/delete.invite.validators.js';
import generateInviteValidations from '../validation/validators/dashboard/generate-invite.validations.js';
import accountDriver from '../drivers/account.driver.js';
import dashboardController from '../controllers/dashboard.controller.js';
import logger from '../logger.js';

/**
 * @description bind controllers to routes for primary app
 * @param {import("express").Express} [app]
 */
export default (app) => {

    logger.debug("Initializing dashbaord router")

    const middlewares = [setNoCache,userAuthMiddleware]

    app.get('/',middlewares,dashboardController.services);
    app.get('/services',middlewares,dashboardController.services);

    app.get('/account',middlewares,dashboardController.account);

    app.get('/account/2fa',middlewares,dashboardController.account2fa);
    app.get('/account/2fa/add',middlewares,dashboardController.accountAdd2fa);
    app.post('/account/2fa/set',middlewares,set2faValidations,dashboardController.accountChange2faPost);

    app.get('/account/password',middlewares,dashboardController.accountChangePassword);
    app.post('/account/password',middlewares,changePasswordValidationsCopy,dashboardController.accountChangePasswordPost);

    app.get('/account/recovery',middlewares,dashboardController.accountRecovery);
    app.get('/account/recovery/set-email',middlewares,dashboardController.accountRecoverySetEmail);
    app.get('/account/recovery/set-token',middlewares,dashboardController.accountRecoverySetToken);
    app.get('/account/recovery/delete-email',middlewares,dashboardController.accountRecoveryDeleteEmail);
    app.get('/account/recovery/delete-token',middlewares,dashboardController.accountRecoveryDeleteToken);
    app.post('/account/recovery/set-email',middlewares,setRecoveryTokenValidations,dashboardController.accountRecoverySetEmailPost);
    app.post('/account/recovery/set-token',middlewares,setRecoveryEmailValidations,dashboardController.accountRecoverySetTokenPost);
    app.post('/account/recovery/delete-email',middlewares,deleteRecoveryMethodValidations,dashboardController.accountRecoveryDeleteEmailPost);
    app.post('/account/recovery/delete-token',middlewares,deleteRecoveryMethodValidations,dashboardController.accountRecoveryDeleteTokenPost);

    app.get('/account/delete',middlewares,dashboardController.accountDelete);
    app.post('/account/delete',middlewares,deleteAccountValidations,dashboardController.accountDeletePost);
    
    app.get('/invites',middlewares,dashboardController.invites);
    app.post('/invites/generate',middlewares,generateInviteValidations,generateCheckUserPersmission(accountDriver.Role.canGenerateInvites),dashboardController.invitesGeneratePost);

    app.get('/invites/share/:invite',middlewares,dashboardController.inviteShare);
    app.post('/invites/terminate',middlewares,deleteInviteValidators,generateCheckUserPersmission(accountDriver.Role.canGenerateInvites),dashboardController.terminateInvite);
}