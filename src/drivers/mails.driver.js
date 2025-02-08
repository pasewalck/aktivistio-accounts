import nodemailer from "nodemailer";
import config from '../config.js';
import logger from "../logger.js";

const transporter = nodemailer.createTransport({
  host: config.mail.host,
  port: config.mail.port,
  secure: config.mail.secure,
  auth: {
    user: config.mail.user,
    pass: config.mail.pass,
  },
});

/**
 * @description send email using transporter config
 * @param {String} [to]
 * @param {String} [subject]
 * @param {String} [text]
 * @param {String} [html]
 */
async function send(to,subject,text,html) {
  const info = await transporter.sendMail({
    from: `${config.mail.name} <${config.mail.user}>`,
    to: to,
    subject: subject,
    text: text,
    html: html,
  });
  logger.debug(`Email has been sent with success`)

}

/**
 * @description send recovery code email
 * @param {String} [to]
 * @param {String} [code]
 */
async function sendRecoveryCode(code,to) {
  const html = `Your recovery code is <b>${code}</b>`
  const text = `Your recovery code is ${code}`

  await send(to,"Your Recovery Code",text,html)
}

/**
 * @description send invite code email
 * @param {String} [to]
 * @param {String} [code]
 */
async function sendInviteCode(code,to) {
  const html = `Your invite code is <b>${code}</b>`
  const text = `Your invite code is ${code}`

  await send(to,"Your Invite Code",text,html)
}


export default {
  sendRecoveryCode,sendInviteCode
}