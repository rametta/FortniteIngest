const mostKills = (matches) => {
  const kills = matches.map((m) => m.k)
  const mostKills = Math.max(...kills)
  const matchKills = matches.find((m) => m.k === mostKills)
  return matchKills
}

module.exports = { mostKills }
