const { values } = require('ramda')
const { db } = require('./initFirebase')
const { mostKills } = require('./mostKills')
const { weeklySummary } = require('./weeklySummary')

const calculateBests = (user) => {
  db.ref(`/matches/${user}`).once('value', (snap) => {
    const matches = values(snap.val())

    const weeklyMap = weeklySummary(matches)
    const kills = mostKills(matches)

    db.ref(`weeklySummary/${user}`).set(weeklyMap)
    kills && db.ref(`/bests/${user}/kills`).set(kills)
  })
}

module.exports = { calculateBests }
