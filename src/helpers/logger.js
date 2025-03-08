import pino from 'pino';
import pretty from "pino-pretty"


// Configure the pretty-printing stream for the logger and enable colorized output for better readability
const stream = pretty({
  colorize: true,
});

// Create a logger instance with the pretty stream
const logger = pino(stream);

logger.info('Initializing logger');

// Handle uncaught exceptions and unhandled promise rejections
process.on('uncaughtException', (err) => {
  logger.fatal('Uncaught Exception:', err);
  process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
  logger.fatal('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1); 
});

export default logger;