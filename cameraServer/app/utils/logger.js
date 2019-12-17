const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;
const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

module.exports = function (config) {
  let transportsList = [];
  if(config.logger.transports.console.level){
    transportsList.push(new transports.Console({
      level: config.logger.transports.console.level
    }));
  }
  if(config.logger.transports.file.level){
    transportsList.push(new transports.File({
      filename: 'errors_Camera_' + config.cameraNumber + '.log',
      level: 'error'
    }));
  }
  const logger = createLogger({
    format: combine(
      label({ label: 'Camera#' + config.cameraNumber}),
      timestamp(),
      myFormat
    ),
    transports: transportsList
  });

  return logger;
};
