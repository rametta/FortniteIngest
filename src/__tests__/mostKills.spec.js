const { values } = require('ramda')
const { mostKills } = require('./../mostKills')
const { matchesMapFixture } = require('./../fixtures/matchesMap.fixture')

test('it should return the match that has the highest kills', () => {
  const matches = values(matchesMapFixture)
  expect(mostKills(matches).k).toEqual(8)
})
