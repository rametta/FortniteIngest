const admin = require('firebase-admin')
const { FIREBASE_DB_URL } = require('./constants')
const firebaseServiceAccount = require('../firebase-admin-creds.json')

admin.initializeApp({
  credential: admin.credential.cert(firebaseServiceAccount),
  databaseURL: FIREBASE_DB_URL,
  databaseAuthVariableOverride: {
    uid: process.env.FIREBASE_AUTH_OVERRIDE
  }
})

module.exports = { db: admin.database() }
