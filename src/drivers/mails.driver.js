import nodemailer from "nodemailer";
import config from '../config.js';
import logger from "../logger.js";
import { renderTemplate } from "../helpers/template-render.js";

const transporter = nodemailer.createTransport({
  host: config.mail.host,
  port: config.mail.port,
  secure: config.mail.secure,
  auth: {
    user: config.mail.user,
    pass: config.mail.pass,
  },
});

const templates = {
  recovery: "recovery",
  invite: "invite"
}

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
async function sendRecoveryCode(code,to,local) {

  const subject = local.__("Your Recovery Code")
  const data = {
    code: code,
    subject: subject,
    ...local
  }

  await send(to,subject
    ,getPlainTextString(templates.recovery,data)
    ,getHTMLString(templates.recovery,data))
}

/**
 * @description send invite code email
 * @param {String} [to]
 * @param {String} [code]
 */
async function sendInviteCode(code,to,local) {

  const subject = local.__("Your Invite Code")
  const data = {
    code: code,
    subject: subject,
    ...local
  }

  await send(to,subject
    ,getPlainTextString(templates.invite,data)
    ,getHTMLString(templates.invite,data))

}
/**
 * @description get html string for mail
 * @param {String} [to]
 * @param {String} [code]
 */
function getHTMLString(name,data) {
  return renderTemplate(`./src/email-templates/${name}/html.ejs`,data)
}
/**
 * @description get plain-text string for mail
 * @param {String} [to]
 * @param {String} [code]
 */
function getPlainTextString(name,data) {
  return renderTemplate(`./src/email-templates/${name}/plain-text.ejs`,data)
}

export default {
  sendRecoveryCode,sendInviteCode
}

