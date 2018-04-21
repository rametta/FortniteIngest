const moment = require('moment')
const regression = require('regression')
const { db } = require('./initFirebase')

const calculateBests = (user) => {
  const matchesRef = db.ref(`/matches/${user}`)
  matchesRef.once('value', (snap) => {
    const matchesMap = snap.val()
    const matches = Object.values(matchesMap)

    // kills
    const kills = matches.map((m) => m.k)
    const mostKills = Math.max(...kills)
    const matchKills = matches.find((m) => m.k === mostKills)
    if (matchKills) {
      db.ref(`/bests/${user}/kills`).set(matchKills)
    }

    // weeks

    const regressionByWeek = {}

    const matchesByWeek = matches.reduce((acc, m) => {
      const year = moment(m.d).year()
      const week = moment(m.d).week()

      if (!acc[year]) {
        acc[year] = {}
      }

      if (!regressionByWeek[year]) {
        regressionByWeek[year] = {}
      }

      if (!acc[year][week]) {
        acc[year][week] = {
          k: 0, // kills
          mp: 0, // matches played
          kpm: 0, // kills per match
          s: 0, // score
          t1: 0, // top 1 - wins
          t3: 0, // top 3
          t5: 0, // top 5
          t6: 0, // top 6
          t10: 0, // top 10
          t12: 0, // top 12
          t25: 0, // top 25
          wp: 0, // win %,
          lr: {
            gradient: 0,
            yIntercept: 0
          } // linear regression
        }
      }

      if (!regressionByWeek[year][week]) {
        regressionByWeek[year][week] = []
      }

      regressionByWeek[year][week].push([
        regressionByWeek[year][week].length + 1,
        m.k || 0
      ])

      const summary = acc[year][week]

      summary.k += m.k || 0
      summary.mp++
      summary.s += m.s || 0
      summary.t1 += m.t1 || 0
      summary.t3 += m.t3 || 0
      summary.t5 += m.t5 || 0
      summary.t6 += m.t6 || 0
      summary.t10 += m.t10 || 0
      summary.t12 += m.t12 || 0
      summary.t25 += m.t25 || 0
      summary.kpm = (summary.k / summary.mp).toFixed(6) || 0
      summary.wp = (summary.t1 / summary.mp).toFixed(6) || 0

      const [gradient, yIntercept] = regression.linear(
        regressionByWeek[year][week]
      ).equation

      summary.lr.gradient = gradient
      summary.lr.yIntercept = yIntercept

      return acc
    }, {})

    db.ref(`weeklySummary/${user}`).set(matchesByWeek)
  })
}

module.exports = { calculateBests }
