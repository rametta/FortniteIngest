const winston = require('winston')
const moment = require('moment')
const { LOGS_DIR, NODE_ENV } = require('./constants')

const tsFormat = () => moment.utc().format('llll')

const logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      timestamp: tsFormat,
      colorize: true
    }),
    new winston.transports.File({
      filename: `${LOGS_DIR}/results.log`,
      timestamp: tsFormat,
      level: NODE_ENV === 'development' ? 'debug' : 'info'
    })
  ]
})

module.exports = { logger }
