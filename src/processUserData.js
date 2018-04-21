const moment = require('moment')
const { db } = require('./initFirebase')
const { logger } = require('./logger')
const { formatMatch } = require('./formatMatch')

const processUserData = (data) => {
  const { epicUserHandle, recentMatches } = data
  data.fetchTime = moment.utc().format()

  recentMatches.forEach((m) => {
    db.ref(`/matches/${epicUserHandle}/${m.id}`).set(formatMatch(m))
  })

  db
    .ref(`/data/${epicUserHandle}`)
    .set(data)
    .then(
      () => logger.info(`${epicUserHandle} processed`),
      () => logger.error(`${epicUserHandle} failed to process`)
    )

  return epicUserHandle
}

module.exports = { processUserData }
