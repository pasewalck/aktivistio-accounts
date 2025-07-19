import mailDriver from "../drivers/mail.driver.js"
import { MessageType } from "../models/email.message-type.js"
/**
 * @description Send recovery link email
 * @param {String} [to]
 * @param {String} [link]
 * @param {JSON} [locals]
 */
async function sendRecoveryLink(link,to,locals) {
    await mailDriver.sendEmail(to,locals.__("Your Recovery Link"),MessageType.RECOVERY_CODE,locals,{link:link})
}
/**
 * @description Send invite code email
 * @param {String} [to]
 * @param {String} [code]
 * @param {JSON} [locals]
 */
async function sendInviteCode(code,to,locals) {
  await mailDriver.sendEmail(to,locals.__("Your Invite Code"),MessageType.INVITE_CODE,locals,{code:code})
}

export default {
  send: {
    inviteCode: sendInviteCode,
    recoveryLink: sendRecoveryLink
  }
}
