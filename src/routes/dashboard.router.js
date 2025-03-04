import {setNoCache} from '../middlewares/set-no-cache.middleware.js'
import {userAuthMiddleware} from '../middlewares/user-auth.middleware.js';
import { generateCheckUserPersmission } from '../middlewares/generator/permission-check.user-role.middleware-generator.js';
import { Permission, Role } from '../models/roles.js';

import changePasswordValidationsCopy from '../validation/validators/dashboard/change-password.validations.js';
import set2faValidations from '../validation/validators/dashboard/set-2fa.validations.js';
import setRecoveryTokenValidations from '../validation/validators/dashboard/set-recovery-token.validations.js';
import setRecoveryEmailValidations from '../validation/validators/dashboard/set-recovery-email.validations.js';
import deleteRecoveryMethodValidations from '../validation/validators/dashboard/delete.recovery-method.validations.js';
import deleteAccountValidations from '../validation/validators/dashboard/delete-account.validations.js';
import deleteInviteValidators from '../validation/validators/dashboard/delete.invite.validators.js';
import generateInviteValidations from '../validation/validators/dashboard/generate-invite.validations.js';
import dashboardController from '../controllers/dashboard.controller.js';
import logger from '../helpers/logger.js';
import shareInviteValidators from '../validation/validators/dashboard/share.invite.validators.js';
import userManageValidators from '../validation/validators/dashboard/user.manage.validators.js';
import manageAccountUpdateValidations from '../validation/validators/dashboard/manage-account.update.validations.js';
import manageAccountDeleteValidations from '../validation/validators/dashboard/manage-account.delete.validations.js';

/**
 * @description bind controllers to routes for primary app
 * @param {import("express").Express} [app]
 */
export default (app) => {

    logger.debug("Initializing dashbaord router")

    const middlewares = [setNoCache,userAuthMiddleware]

    app.get('/',middlewares,dashboardController.services);
    app.get('/services',middlewares,dashboardController.services);

    app.get('/users',middlewares,generateCheckUserPersmission(Permission.MANAGE_USERS),dashboardController.users);
    app.get('/user/:id',middlewares,generateCheckUserPersmission(Permission.MANAGE_USERS),userManageValidators,dashboardController.manageUser);

    app.post('/user/:id/update',middlewares,generateCheckUserPersmission(Permission.MANAGE_USERS),userManageValidators,manageAccountUpdateValidations,dashboardController.manageUserUpdatePost);
    app.post('/user/:id/delete',middlewares,generateCheckUserPersmission(Permission.DELETE_USERS),userManageValidators,manageAccountDeleteValidations,dashboardController.manageUserDeletePost);

    app.get('/services/add',middlewares,dashboardController.serviceAdd);
    app.get('/services/edit/:id',middlewares,dashboardController.serviceEdit);

    app.post('/services/add',middlewares,dashboardController.serviceAdd);
    app.post('/services/edit/:id/save',middlewares,dashboardController.serviceEditSavePost);
    app.post('/services/edit/:id/delete',middlewares,dashboardController.serviceEditDeletePost);

    app.get('/account',middlewares,dashboardController.account);

    app.get('/account/2fa',middlewares,dashboardController.account2fa);
    app.get('/account/2fa/add',middlewares,dashboardController.accountAdd2fa);
    app.post('/account/2fa/set',middlewares,set2faValidations,dashboardController.accountChange2faPost);
    app.post('/account/2fa/remove',middlewares,dashboardController.accountRemove2faPost);

    app.get('/account/password',middlewares,dashboardController.accountChangePassword);
    app.post('/account/password',middlewares,changePasswordValidationsCopy,dashboardController.accountChangePasswordPost);

    app.get('/account/recovery',middlewares,dashboardController.accountRecovery);
    app.get('/account/recovery/set-email',middlewares,dashboardController.accountRecoverySetEmail);
    app.get('/account/recovery/set-token',middlewares,dashboardController.accountRecoverySetToken);
    app.get('/account/recovery/delete-email',middlewares,dashboardController.accountRecoveryDeleteEmail);
    app.get('/account/recovery/delete-token',middlewares,dashboardController.accountRecoveryDeleteToken);
    app.post('/account/recovery/set-email',middlewares,setRecoveryEmailValidations,dashboardController.accountRecoverySetEmailPost);
    app.post('/account/recovery/set-token',middlewares,setRecoveryTokenValidations,dashboardController.accountRecoverySetTokenPost);
    app.post('/account/recovery/delete-email',middlewares,deleteRecoveryMethodValidations,dashboardController.accountRecoveryDeleteEmailPost);
    app.post('/account/recovery/delete-token',middlewares,deleteRecoveryMethodValidations,dashboardController.accountRecoveryDeleteTokenPost);

    app.get('/account/delete',middlewares,dashboardController.accountDelete);
    app.post('/account/delete',middlewares,deleteAccountValidations,dashboardController.accountDeletePost);
    
    app.get('/invites',middlewares,dashboardController.invites);
    app.post('/invites/generate',middlewares,generateInviteValidations,generateCheckUserPersmission(Permission.MANAGE_OWN_INVITES),dashboardController.invitesGeneratePost);

    app.get('/invites/share/:invite',middlewares,shareInviteValidators,dashboardController.inviteShare);
    app.post('/invites/terminate',middlewares,deleteInviteValidators,generateCheckUserPersmission(Permission.MANAGE_OWN_INVITES),dashboardController.terminateInvitePost);
}