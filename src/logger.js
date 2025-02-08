import pino from 'pino';
import pretty from "pino-pretty"

const stream = pretty({
  colorize: true
})
const logger = pino(stream)

logger.info('Initializing logger');

process.on('uncaughtException', (err) => {
    logger.fatal(err);
    process.exit(1);
});
  
process.on('unhandledRejection', (err) => {
    logger.fatal(err);
    process.exit(1);
});

export default logger