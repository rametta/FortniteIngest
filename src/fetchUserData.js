const axios = require('axios')
const { from } = require('rxjs/observable/from')
const { EPIC_API_URL } = require('./constants')

const headers = { 'TRN-Api-Key': process.env.TRN_API_KEY }

const fetchUserData$ = (user) => {
  const url = EPIC_API_URL + user
  const promise = axios.get(url, { headers })
  return from(promise)
}

module.exports = { fetchUserData$ }
