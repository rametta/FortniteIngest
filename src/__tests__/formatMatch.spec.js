const { formatMatch } = require('./../formatMatch')
const {
  formattedMatchFixture
} = require('./../fixtures/formattedMatch.fixture')
const {
  unformattedMatchFixture
} = require('./../fixtures/unformattedMatch.fixture')

test('it should format a match into an object ready to be saved', () => {
  expect(formatMatch(unformattedMatchFixture)).toEqual(formattedMatchFixture)
})
