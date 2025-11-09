/* 
 * This file is part of "Aktivistio Accounts".
 *
 * The project "Aktivistio Accounts" implements an account system and 
 * management platform combined with an OAuth 2.0 Authorization Server.
 *
 * "Aktivistio Accounts" is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * "Aktivistio Accounts" is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with "Aktivistio Accounts". If not, see https://www.gnu.org/licenses/.
 *
 * Copyright (C) 2025 Jana Caroline Pasewalck
 */
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
