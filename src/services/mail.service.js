import mailDriver from "../drivers/mail.driver.js"
import { MessageType } from "../models/email.message-type.js"
/**
 * @description Send recovery code email
 * @param {String} [to]
 * @param {String} [code]
 * @param {JSON} [locals]
 */
async function sendRecoveryCode(code,to,locals) {
    await mailDriver.sendEmail(to,locals.__("Your Recovery Code"),MessageType.RECOVERY_CODE,locals,{code:code})
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
    recoveryCode: sendRecoveryCode
  }
}
