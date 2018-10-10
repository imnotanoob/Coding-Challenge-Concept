var winston = require('winston');
var config = require('../config');
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
      /*
       - Write to all logs with level `info` and below to `combined.log` 
       - Write all logs error (and below) to `error.log`.
       - All logging levels: https://github.com/winstonjs/winston#logging-levels, info is 6, and error is 3

      */
      new winston.transports.File({ filename: 'error.log', level: 'error', timestamp: true}),
      new winston.transports.File({ filename: 'combined.log', timestamp: true })
    ]
  });
  
  //
  // If we're not in production then log to the `console` with the format:
  // `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
  // 
  if (config.NODE_ENV !== 'prod') {
    logger.add(new winston.transports.Console({
      format: winston.format.simple(),
      timestamp: true
    }));
  }

const loggerFileName = (fileName) => {
    var myLogger = {
        error: function(text) {
            logger.error(fileName + ': ' + text);
        },
        info: function(text) {
            logger.info(fileName + ': ' + text);
        }
    }
    return myLogger;
};


module.exports = loggerFileName;