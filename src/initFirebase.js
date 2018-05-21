const admin = require('firebase-admin')
const { FIREBASE_DB_URL, FIREBASE_AUTH_OVERRIDE } = require('./constants')
const firebaseServiceAccount = require('../firebase-admin-creds.json')

const app = admin.initializeApp({
  credential: admin.credential.cert(firebaseServiceAccount),
  databaseURL: FIREBASE_DB_URL,
  databaseAuthVariableOverride: {
    uid: FIREBASE_AUTH_OVERRIDE
  }
})

module.exports = { db: admin.database(), app }
