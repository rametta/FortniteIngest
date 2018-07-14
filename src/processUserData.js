const moment = require('moment')
const { db } = require('./initFirebase')
const { formatMatch } = require('./formatMatch')

const processUserData = (data) => {
  const { epicUserHandle, recentMatches } = data
  data.fetchTime = moment.utc().format()

  recentMatches.map((m) => {
    db.ref(`/matches/${epicUserHandle}/${m.id}`).set(formatMatch(m))
  })

  db.ref(`/data/${epicUserHandle}`)
    .set(data)
    .then(
      () =>
        console.log(`${epicUserHandle} processed - ${moment().format('llll')}`),
      () =>
        console.error(
          `${epicUserHandle} failed to process - ${moment().format('llll')}`
        )
    )
}

module.exports = { processUserData }
