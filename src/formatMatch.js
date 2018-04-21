const moment = require('moment')

const formatMatch = (match) => ({
  mid: match.id || 0,
  k: match.kills || 0,
  p: match.playlist || 0,
  t1: match.top1 || 0,
  t3: match.top3 || 0,
  t5: match.top5 || 0,
  t6: match.top6 || 0,
  t10: match.top10 || 0,
  t12: match.top12 || 0,
  t25: match.top25 || 0,
  s: match.score || 0,
  m: match.minutesPlayed || 0,
  d:
    moment(match.dateCollected)
      .utc()
      .format() || 0,
  r: match.trnRating || 0,
  c: match.trnRatingChange || 0
})

module.exports = { formatMatch }
