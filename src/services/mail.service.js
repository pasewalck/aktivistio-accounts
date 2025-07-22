import mailDriver from "../drivers/mail.driver.js"
import { MessageType } from "../models/email.message-type.js"
/**
 * @description Send recovery link email
 * @param {String} [to]
 * @param {String} [link]
 * @param {JSON} [locals]
 */
async function sendRecoveryLink(link,to,locals) {
    await mailDriver.sendEmail(to,locals.__("email-subject.your-recovery-link"),MessageType.RECOVERY_CODE,locals,{link:link})
}
/**
 * @description Send invite code email
 * @param {String} [to]
 * @param {String} [code]
 * @param {JSON} [locals]
 */
async function sendInviteCode(code,to,locals) {
  await mailDriver.sendEmail(to,locals.__("email-subject.your-invite-code"),MessageType.INVITE_CODE,locals,{code:code})
}
/**
 * @description Send setup email
 * @param {String} [to]
 * @param {String} [code]
 * @param {JSON} [locals]
 */
async function sendSetupLink(link,to,locals) {
  await mailDriver.sendEmail(to,locals.__("email-subject.your-new-account"),MessageType.ACCOUNT_SETUP,locals,{link:link})
}


export default {
  send: {
    inviteCode: sendInviteCode,
    setupLink: sendSetupLink,
    recoveryLink: sendRecoveryLink
  }
}
