const admin = require('firebase-admin')
const firebaseServiceAccount = require('../firebase-admin-creds.json')
const firebaseDbUrl = 'https://fortnite-ingest.firebaseio.com/'

admin.initializeApp({
  credential: admin.credential.cert(firebaseServiceAccount),
  databaseURL: firebaseDbUrl,
  databaseAuthVariableOverride: {
    uid: process.env.FIREBASE_AUTH_OVERRIDE
  }
})

const db = admin.database()

module.exports = { db }
