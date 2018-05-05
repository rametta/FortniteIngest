const { values } = require('ramda')
const { matchesMapFixture } = require('./../fixtures/matchesMap.fixture')
const { weeklySummaryFixture } = require('./../fixtures/weeklySummary.fixture')
const { weeklySummary } = require('./../weeklySummary')

test('it should reduce matches into a weekly summary', () => {
  const matches = values(matchesMapFixture)
  expect(weeklySummary(matches)).toEqual(weeklySummaryFixture)
})
