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
import nodemailer from "nodemailer";
import logger from "../helpers/logger.js";
import { renderEjsFile } from "../helpers/ejs-render.js";
import { RenderMode } from "../models/email.render-mode.js"
import { MessageType } from "../models/email.message-type.js";
import env from "../helpers/env.js";
import { assembleUrl, extendUrl } from "../helpers/url.js";

const transporter = nodemailer.createTransport({
  host: env.MAIL.HOST,
  port: env.MAIL.PORT,
  secure: env.MAIL.SECURE,
  auth: {
    user: env.MAIL.USER,
    pass: env.MAIL.PASS
  }
});
/**
 * @description get full string for mail
 * @param {MessageType} [messageType]
 * @param {RenderMode} [renderMode]
 * @param {JSON} [data]
 */
async function getFullMessageString(messageType,renderMode,data) {
  return await render(`layouts`,renderMode,{...data,body:await render(messageType,renderMode,data)})
}
/**
 * @description render email partial string
 * @param {String} [view]
 * @param {RenderMode} [renderMode]
 * @param {JSON} [data]
 */
async function render(view,renderMode,data) {
  return await renderEjsFile(`./src/email-views/${view}/${renderMode}.ejs`,data)
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
        subject: subject,
        title: subject,
        baseUrl:env.BASE_URL,
        urlUtils: {
          assembleUrl,
          extendUrl
        },
        app: {
          name: env.APPLICATION_NAME, 
          logo: env.APPLICATION_LOGO
        },
        ...locals,...extraData
    }

    const text = await getFullMessageString(messageType,RenderMode.PLAIN_TEXT,data)
    const html = await getFullMessageString(messageType,RenderMode.HTML,data)

    const info = await transporter.sendMail({
        from: `${env.MAIL.SENDER_DISPLAY_NAME} <${env.MAIL.USER}>`,
        to: to,
        subject: subject,
        text: text,
        html: html,
        attachments: [
        {
            filename: env.APPLICATION_LOGO,
            path: env.APPLICATION_LOGO,
            cid: env.APPLICATION_LOGO
        }
        ]
    });
    logger.debug(`Email has been sent with success`)
  }
}
