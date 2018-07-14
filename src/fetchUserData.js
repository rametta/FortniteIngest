const axios = require('axios')
const { EPIC_API_URL, TRN_API_KEY } = require('./constants')

const headers = { 'TRN-Api-Key': TRN_API_KEY }

// fetchUserData :: String -> Promise
const fetchUserData = (user) => axios.get(EPIC_API_URL + user, { headers })

module.exports = { fetchUserData }
