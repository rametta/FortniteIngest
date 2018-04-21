const winston = require('winston')
const moment = require('moment')

const tsFormat = () => moment.utc().format('llll')

const logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      timestamp: tsFormat,
      colorize: true
    }),
    new winston.transports.File({
      filename: `${process.env.LOGS_DIR}/results.log`,
      timestamp: tsFormat,
      level: process.env.NODE_ENV === 'development' ? 'debug' : 'info'
    })
  ]
})

module.exports = { logger }
