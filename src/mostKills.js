const { map, max, find, propEq, compose } = require('ramda')

const getArrMax = (arr) => max(...arr)

const findMost = (matches) => (mostKills) =>
  find(propEq('k', mostKills))(matches)

const mostKills = (matches) =>
  compose(findMost(matches), getArrMax, map((m) => m.k))(matches)

module.exports = { mostKills }
