const moment = require('moment')
const { formatMatch } = require('./formatMatch')

const processUserData = (data) => {
  const { recentMatches } = data
  return {
    dataWDate: { ...data, fetchTime: moment.utc().format() },
    matches: recentMatches.map(formatMatch)
  }
}

module.exports = { processUserData }
