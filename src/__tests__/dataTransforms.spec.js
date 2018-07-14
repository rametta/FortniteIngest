// Formatters
const { formatMatch } = require('./../formatMatch')

// Fixtures
const {
  formattedMatchFixture
} = require('./../fixtures/formattedMatch.fixture')
const {
  unformattedMatchFixture
} = require('./../fixtures/unformattedMatch.fixture')

describe('Data transformation utilities', () => {
  test('it should format a match into an object ready to be saved', () => {
    expect(formatMatch(unformattedMatchFixture)).toEqual(formattedMatchFixture)
  })
})
