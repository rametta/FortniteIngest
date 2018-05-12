require('dotenv').config()

module.exports = {
  EPIC_API_URL: 'https://api.fortnitetracker.com/v1/profile/xbox/',
  FIREBASE_DB_URL: 'https://fortnite-ingest.firebaseio.com/',
  XBOX_API_URL: 'https://xboxapi.com/v2',
  TRN_API_KEY: process.env.TRN_API_KEY,
  XBOX_API_KEY: process.env.XBOX_API_KEY,
  LOGS_DIR: process.env.LOGS_DIR || 'logs',
  NODE_ENV: process.env.NODE_ENV,
  USER_DELAY_INTERVAL: process.env.USER_DELAY_INTERVAL || 5000,
  REFRESH_INTERVAL: process.env.REFRESH_INTERVAL || 1000,
  FIREBASE_AUTH_OVERRIDE: process.env.FIREBASE_AUTH_OVERRIDE
}
