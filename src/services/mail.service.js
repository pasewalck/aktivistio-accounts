import mailDriver from '../drivers/mail.driver.js';
import { MessageType } from '../models/email.message-type.js';
import logger from '../helpers/logger.js';

/**
 * @description Send recovery link email
 * @param {String} [to]
 * @param {String} [link]
 * @param {JSON} [locals]
 */
async function sendRecoveryLink(link, to, locals) {
	try {
		await mailDriver.sendEmail(
			to,
			locals.__('email.subject.your_recovery_link'),
			MessageType.RECOVERY_CODE,
			locals,
			{
				link: link,
			}
		);
	} catch (error) {
		logger.error(`Error sending recovery link email to ${to}: ${error}`);
		throw error;
	}
}
/**
 * @description Send invite code email
 * @param {String} [to]
 * @param {String} [code]
 * @param {JSON} [locals]
 */
async function sendInviteCode(code, to, locals) {
	try {
		await mailDriver.sendEmail(to, locals.__('email.subject.your_invite_code'), MessageType.INVITE_CODE, locals, {
			code: code,
		});
	} catch (error) {
		logger.error(`Error sending invite code email to ${to}: ${error}`);
		throw error;
	}
}
/**
 * @description Send setup email
 * @param {String} [to]
 * @param {String} [code]
 * @param {JSON} [locals]
 */
async function sendSetupLink(link, to, locals) {
	try {
		await mailDriver.sendEmail(to, locals.__('email.subject.your_new_account'), MessageType.ACCOUNT_SETUP, locals, {
			link: link,
		});
	} catch (error) {
		logger.error(`Error sending setup link email to ${to}: ${error}`);
		throw error;
	}
}

export default {
	send: {
		inviteCode: sendInviteCode,
		setupLink: sendSetupLink,
		recoveryLink: sendRecoveryLink,
	},
};
