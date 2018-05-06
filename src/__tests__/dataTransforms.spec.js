// Utils
const { values } = require('ramda')

// Formatters
const { formatMatch } = require('./../formatMatch')
const { mostKills } = require('./../mostKills')
const { weeklySummary } = require('./../weeklySummary')

// Fixtures
const { matchesMapFixture } = require('./../fixtures/matchesMap.fixture')
const { weeklySummaryFixture } = require('./../fixtures/weeklySummary.fixture')
const {
  formattedMatchFixture
} = require('./../fixtures/formattedMatch.fixture')
const {
  unformattedMatchFixture
} = require('./../fixtures/unformattedMatch.fixture')

// Test suit
describe('Data transformation utilities', () => {
  test('it should format a match into an object ready to be saved', () => {
    expect(formatMatch(unformattedMatchFixture)).toEqual(formattedMatchFixture)
  })

  test('it should return the match that has the highest kills', () => {
    const matches = values(matchesMapFixture)
    expect(mostKills(matches).k).toBe(8)
  })

  test('it should reduce matches into a weekly summary', () => {
    const matches = values(matchesMapFixture)
    expect(weeklySummary(matches)).toEqual(weeklySummaryFixture)
  })
})
