const axios = require('axios')
const { from } = require('rxjs/observable/from')

const API = 'https://api.fortnitetracker.com/v1/profile/xbox/'
const headers = { 'TRN-Api-Key': process.env.TRN_API_KEY }

const fetchUserData$ = (user) => {
  const url = API + user
  const promise = axios.get(url, { headers })
  return from(promise)
}

module.exports = { fetchUserData$ }
