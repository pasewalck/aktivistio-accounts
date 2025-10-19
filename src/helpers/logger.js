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
 * along with "Aktivistio Accounts". If not, see <https://www.gnu.org/licenses/>.
 *
 * Copyright (C) 2025 Jana
 */

import path from 'path';
import pino from 'pino';
import pretty from "pino-pretty"


// Configure the pretty-printing stream for the logger and enable colorized output for better readability
const stream = pretty({
  colorize: true,
});

const appName = path.basename(process.argv[1], path.extname(process.argv[1]));

// Create a logger instance with the pretty stream and application name
const logger = pino({
  name: appName,
}, stream);

logger.info('Initializing logger');

// Handle uncaught exceptions and unhandled promise rejections
process.on('uncaughtException', (err) => {
  logger.fatal('Uncaught Exception:
' + err.stack || err); // Log the stack trace if available
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.fatal('Unhandled Rejection at:
' + promise + '
reason:
' + reason.stack || reason); // Log the stack trace if available
  process.exit(1); 
});

export default logger;
