import nodemailer from "nodemailer";
import config from '../config.js';
import logger from "../logger.js";
import { renderTemplate } from "../helpers/template-render.js";
import { RenderMode } from "../models/email.render-mode.js"
import { MessageType } from "../models/email.message-type.js";

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
 * @description get full string for mail
 * @param {MessageType} [messageType]
 * @param {RenderMode} [renderMode]
 * @param {JSON} [data]
 */
function getFullMessageString(messageType,renderMode,data) {
  return render(`layouts`,renderMode,{...data,body:render(messageType,renderMode,data)})
}
/**
 * @description render email partial string
 * @param {String} [view]
 * @param {RenderMode} [renderMode]
 * @param {JSON} [data]
 */
function render(view,renderMode,data) {
  return renderTemplate(`./src/email-views/${view}/${renderMode}.ejs`,data)
}
export default {
  /**
   * @description send Email
   * @param {String} [to]
   * @param {String} [subject]
   * @param {MessageType} [messageType]
   * @param {JSON} [locals]
   * @param {JSON} [extraData]
   */
  sendEmail: async (to,subject,messageType,locals,extraData) => {
    
    const data = {
        subject: subject,title: subject,
        baseUrl:config.baseUrl,app: { name: config.applicationName, logo: config.applicationLogo },
        ...locals,...extraData
    }

    const text = getFullMessageString(messageType,RenderMode.PLAIN_TEXT,data)
    const html = getFullMessageString(messageType,RenderMode.HTML,data)

    const info = await transporter.sendMail({
        from: `${config.mail.name} <${config.mail.user}>`,
        to: to,
        subject: subject,
        text: text,
        html: html,
        attachments: [
        {
            filename: config.applicationLogo,
            path: config.applicationLogo,
            cid: config.applicationLogo
        }
        ]
    });
    logger.debug(`Email has been sent with success`)
  }
}

