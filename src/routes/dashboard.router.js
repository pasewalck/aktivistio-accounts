import {setNoCache} from '../middlewares/set-no-cache.middleware.js'
import {userAuthMiddleware} from '../middlewares/user-auth.middleware.js';
import { generateCheckUserPermission } from '../middlewares/generator/permission-check.user-role.middleware-generator.js';
import { Permission } from '../models/roles.js';

import ownAccountChangePasswordValidations from '../validation/validators/dashboard/own-account/own-account.change-password.validations.js';
import ownAccountSet2faValidations from '../validation/validators/dashboard/own-account/own-account.set-2fa.validations.js';
import ownAccountRecoveryTokenSetValidations from '../validation/validators/dashboard/own-account/own-account.recovery-token.set.validations.js';
import ownAccountRecoveryEmailSetValidations from '../validation/validators/dashboard/own-account/own-account.recovery-email.set.validations.js';
import ownAccountRecoveryMethodDeleteValidations from '../validation/validators/dashboard/own-account/own-account.recovery-method.delete.validations.js';
import ownAccountDeleteValidations from '../validation/validators/dashboard/own-account/own-account.delete.validations.js';
import deleteInviteValidators from '../validation/validators/dashboard/invites/invite.delete.validators.js';
import generateInviteValidations from '../validation/validators/dashboard/invites/invite.generate.validations.js';
import dashboardController from '../controllers/dashboard.controller.js';
import logger from '../helpers/logger.js';
import shareInviteValidators from '../validation/validators/dashboard/invites/invite.share.validators.js';
import userManageValidators from '../validation/validators/dashboard/system-management/accounts/manage.account.get.validators.js';
import manageAccountUpdateValidations from '../validation/validators/dashboard/system-management/accounts/manage.account.update.validations.js';
import manageAccountDeleteValidations from '../validation/validators/dashboard/system-management/accounts/manage-account.delete.validations.js';
import manageServiceGetValidators from '../validation/validators/dashboard/system-management/services/manage.service.get.validators.js';
import manageServiceUpdateValidations from '../validation/validators/dashboard/system-management/services/manage.service.update.validations.js';
import manageServiceDeleteValidations from '../validation/validators/dashboard/system-management/services/manage.service.delete.validations.js';
import bruteProtectionMiddleware from '../middlewares/brute-protection.middleware.js'
/**
 * @description Binds controller actions to routes for the primary app.
 * @param {import("express").Express} app - The Express application instance.
 */
export default (app) => {

    logger.debug("Initializing dashboard router");

    // Common middlewares for all routes
    const middlewares = [setNoCache, userAuthMiddleware, bruteProtectionMiddleware];

    // Dashboard routes
    app.get('/', middlewares, dashboardController.services);
    app.get('/services', middlewares, dashboardController.services);

    // User management routes
    app.get('/users', middlewares, generateCheckUserPermission(Permission.MANAGE_USERS), dashboardController.users);
    app.get('/user/:id', middlewares, generateCheckUserPermission(Permission.MANAGE_USERS), userManageValidators, dashboardController.manageUser);
    app.post('/user/:id/update', middlewares, generateCheckUserPermission(Permission.MANAGE_USERS), userManageValidators, manageAccountUpdateValidations, dashboardController.manageUserUpdatePost);
    app.post('/user/:id/delete', middlewares, generateCheckUserPermission(Permission.DELETE_USERS), userManageValidators, manageAccountDeleteValidations, dashboardController.manageUserDeletePost);

    // Service management routes
    app.get('/services/add', middlewares, generateCheckUserPermission(Permission.MANAGE_SERVICES), dashboardController.serviceAdd);
    app.get('/services/edit/:id', middlewares, generateCheckUserPermission(Permission.MANAGE_SERVICES), manageServiceGetValidators, dashboardController.serviceEdit);
    app.post('/services/add', middlewares, generateCheckUserPermission(Permission.MANAGE_SERVICES), manageServiceUpdateValidations, dashboardController.serviceAddPost);
    app.post('/services/edit/:id/save', middlewares, generateCheckUserPermission(Permission.MANAGE_SERVICES), manageServiceUpdateValidations, manageServiceGetValidators, dashboardController.serviceEditSavePost);
    app.post('/services/edit/:id/delete', middlewares, generateCheckUserPermission(Permission.MANAGE_SERVICES), manageServiceDeleteValidations, manageServiceGetValidators, dashboardController.serviceEditDeletePost);

    // Account management routes
    app.get('/account', middlewares, dashboardController.account);
    app.get('/account/2fa', middlewares, dashboardController.account2fa);
    app.get('/account/2fa/add', middlewares, dashboardController.accountAdd2fa);
    app.post('/account/2fa/set', middlewares, ownAccountSet2faValidations, dashboardController.accountChange2faPost);
    app.post('/account/2fa/remove', middlewares, dashboardController.accountRemove2faPost);
    app.post('/account/password', middlewares, ownAccountChangePasswordValidations, dashboardController.accountChangePasswordPost);

    // Account recovery routes
    app.get('/account/recovery', middlewares, dashboardController.accountRecovery);
    app.get('/account/recovery/set-email', middlewares, dashboardController.accountRecoverySetEmail);
    app.get('/account/recovery/set-token', middlewares, dashboardController.accountRecoverySetToken);
    app.get('/account/recovery/delete-email', middlewares, dashboardController.accountRecoveryDeleteEmail);
    app.get('/account/recovery/delete-token', middlewares, dashboardController.accountRecoveryDeleteToken);
    app.post('/account/recovery/set-email', middlewares, ownAccountRecoveryEmailSetValidations, dashboardController.accountRecoverySetEmailPost);
    app.post('/account/recovery/set-token', middlewares, ownAccountRecoveryTokenSetValidations, dashboardController.accountRecoverySetTokenPost);
    app.post('/account/recovery/delete-email', middlewares, ownAccountRecoveryMethodDeleteValidations, dashboardController.accountRecoveryDeleteEmailPost);
    app.post('/account/recovery/delete-token', middlewares, ownAccountRecoveryMethodDeleteValidations, dashboardController.accountRecoveryDeleteTokenPost);

    // Account deletion routes
    app.get('/account/delete', middlewares, dashboardController.accountDelete);
    app.post('/account/delete', middlewares, ownAccountDeleteValidations, dashboardController.accountDeletePost);
    
    // Invite management routes
    app.get('/invites', middlewares, dashboardController.invites);
    app.post('/invites/generate', middlewares, generateInviteValidations, generateCheckUserPermission(Permission.MANAGE_OWN_INVITES), dashboardController.invitesGeneratePost);
    app.get('/invites/share/:invite', middlewares, shareInviteValidators, dashboardController.inviteShare);
    app.post('/invites/terminate', middlewares, deleteInviteValidators, generateCheckUserPermission(Permission.MANAGE_OWN_INVITES), dashboardController.terminateInvitePost);

    // Logout route
    app.post('/logout', middlewares, dashboardController.logoutPost);

}
