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
    db.ref(`/matches/${username}/${m.id}`).set(compactMatch(m))
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

const compactMatch = (match) => ({
  mid: match.id || 0,
  k: match.kills || 0,
  p: match.playlist || 0,
  t1: match.top1 || 0,
  t3: match.top3 || 0,
  t5: match.top5 || 0,
  t6: match.top6 || 0,
  t10: match.top10 || 0,
  t12: match.top12 || 0,
  t25: match.top25 || 0,
  s: match.score || 0,
  m: match.minutesPlayed || 0,
  d: toUTC(new Date(match.dateCollected)).toISOString() || 0,
  r: match.trnRating || 0,
  c: match.trnRatingChange || 0
})
