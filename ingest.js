'use strict'

require('dotenv').config()
const axios = require('axios')
const Rx = require('rxjs/Rx')
const admin = require('firebase-admin')
const winston = require('winston')
const fs = require('fs')

const env = process.env.NODE_ENV || 'development'

// Create the logs directory if it does not exist
const logsDir = process.env.LOGS_DIR
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir)
}

const tsFormat = () => new Date().toString()

const logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      timestamp: tsFormat,
      colorize: true
    }),
    new winston.transports.File({
      filename: `${logsDir}/results.log`,
      timestamp: tsFormat,
      level: env === 'development' ? 'debug' : 'info'
    })
  ]
})

// Constants
const firebaseServiceAccount = require('./firebase-admin-creds.json')
const firebaseDbUrl = 'https://fortnite-ingest.firebaseio.com/'
const API = 'https://api.fortnitetracker.com/v1/profile/xbox/'
const headers = { 'TRN-Api-Key': process.env.TRN_API_KEY }
const userDelayInterval = 3000 // api limit
const refreshInterval = 1000

// Connect to firebase
admin.initializeApp({
  credential: admin.credential.cert(firebaseServiceAccount),
  databaseURL: firebaseDbUrl,
  databaseAuthVariableOverride: {
    uid: process.env.FIREBASE_AUTH_OVERRIDE
  }
})

const db = admin.database()

// Get the users to ingest
const users$ = Rx.Observable.create((observer) => {
  const userRef = db.ref('/users')
  userRef.on('value', (snapshot) => {
    const usersMap = snapshot.val()
    const users = Object.keys(usersMap).map((key) => usersMap[key])
    observer.next(users)
  })
})

// Ingest data for users
const schedule$ = Rx.Observable.interval(refreshInterval)

users$
  .switchMap((users) => schedule$, (users) => users)
  .mergeAll()
  .concatMap((user) => Rx.Observable.of(user).delay(userDelayInterval))
  .mergeMap((user) => getUserData$(user))
  .filter(({ data }) => data.error === undefined)
  .map(({ data }) => processUserData(data))
  .retry()
  .subscribe({ error: () => logger.error(`Fetch failed`) })

// Helper for accessing data from 3rd party api
const getUserData$ = (user) => {
  const url = API + user
  const promise = axios.get(url, { headers })
  return Rx.Observable.from(promise)
}

// Data received processor and saver
const processUserData = (data) => {
  const username = data.epicUserHandle
  data.fetchTime = new Date().toISOString()
  db.ref(`/data/${username}`).push(data)
  logger.info(`${username} processed`)
}
