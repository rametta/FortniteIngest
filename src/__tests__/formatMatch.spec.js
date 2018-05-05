const { formatMatch } = require('./../formatMatch')
const { formattedMatch } = require('./../fixtures/formattedMatch')
const { unformattedMatch } = require('./../fixtures/unformattedMatch')

test('format a match into an object ready to be saved', () => {
  expect(formatMatch(unformattedMatch)).toEqual(formattedMatch)
})
