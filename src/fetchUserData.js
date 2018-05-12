const axios = require('axios')
const { from } = require('rxjs/observable/from')
const { EPIC_API_URL, TRN_API_KEY } = require('./constants')

const headers = { 'TRN-Api-Key': TRN_API_KEY }

const fetchUserData$ = (user) => {
  const url = EPIC_API_URL + user
  const promise = axios.get(url, { headers })
  return from(promise)
}

module.exports = { fetchUserData$ }
