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

logger.info(`App started`)

// Constants
const firebaseServiceAccount = require('./firebase-admin-creds.json')
const firebaseDbUrl = 'https://fortnite-ingest.firebaseio.com/'
const API = 'https://api.fortnitetracker.com/v1/profile/xbox/'
const headers = { 'TRN-Api-Key': process.env.TRN_API_KEY }
const USER_DELAY_INTERVAL = process.env.USER_DELAY_INTERVAL || 3000
const REFRESH_INTERVAL = process.env.REFRESH_INTERVAL || 3000

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
    const users = Object.values(usersMap)
    observer.next(users)
  })
})

// Ingest data for users
const timer$ = Rx.Observable.timer(0, REFRESH_INTERVAL)

Rx.Observable.combineLatest(users$, timer$)
  .mergeMap(([users]) => users)
  .concatMap((users) => Rx.Observable.of(users).delay(USER_DELAY_INTERVAL))
  .mergeMap((user) => getUserData$(user))
  .filter(({ data }) => data.error === undefined)
  .map(({ data }) => processUserData(data))
  .retry()
  .subscribe()

// Helper for accessing data from 3rd party api
const getUserData$ = (user) => {
  const url = API + user
  const promise = axios.get(url, { headers })
  return Rx.Observable.from(promise)
}

// Data received processor and saver
const processUserData = (data) => {
  const username = data.epicUserHandle
  data.fetchTime = toUTC(new Date()).toISOString()

  // Save a record of each match, use abbreviations to save storage room
  data.recentMatches.forEach((m) => {
    db.ref(`/matches/${username}/${m.id}`).set({
      k: m.kills, // kills
      p: m.playlist, // playlist (gamemode)
      t: m.top1, // top1
      s: m.score, // score
      d: toUTC(new Date(m.dateCollected)).toISOString(), // date
      r: m.trnRating, // trnRating,
      c: m.trnRatingChange // rating change
    })
  })

  db
    .ref(`/data/${username}`)
    .set(data)
    .then(
      () => logger.info(`${username} processed`),
      () => logger.error(`${username} failed to process`)
    )
}

const toUTC = (date) => {
  return new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds()
  )
}
