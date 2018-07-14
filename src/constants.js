require('dotenv').config()

module.exports = {
  EPIC_API_URL: 'https://api.fortnitetracker.com/v1/profile/xbox/',
  FIREBASE_DB_URL: 'https://fortnite-ingest.firebaseio.com/',
  TRN_API_KEY: process.env.TRN_API_KEY,
  NODE_ENV: process.env.NODE_ENV,
  FIREBASE_AUTH_OVERRIDE: process.env.FIREBASE_AUTH_OVERRIDE
}
