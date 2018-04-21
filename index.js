'use strict'

require('dotenv').config()
const { Observable } = require('rxjs/Observable')
const {
  mergeMap,
  filter,
  concatMap,
  map,
  retry,
  delay,
  tap
} = require('rxjs/operators')
const { combineLatest } = require('rxjs/observable/combineLatest')
const { timer } = require('rxjs/observable/timer')
const { of } = require('rxjs/observable/of')
const fs = require('fs')
const { fetchUserData$ } = require('./src/fetchUserData')
const { processUserData } = require('./src/processUserData')
const { calculateBests } = require('./src/calculateBests')
const { db } = require('./src/initFirebase')
const { logger } = require('./src/logger')

const USER_DELAY_INTERVAL = process.env.USER_DELAY_INTERVAL || 3000
const REFRESH_INTERVAL = process.env.REFRESH_INTERVAL || 3000

if (!fs.existsSync(process.env.LOGS_DIR)) {
  fs.mkdirSync(process.env.LOGS_DIR)
  logger.info(`Creating logs directory`)
}

logger.info(`App started`)

const users$ = Observable.create((observer) => {
  const userRef = db.ref('/users')
  userRef.on('value', (snapshot) => {
    const usersMap = snapshot.val()
    const users = Object.values(usersMap)
    observer.next(users)
  })
})

const timer$ = timer(0, REFRESH_INTERVAL)

combineLatest(users$, timer$)
  .pipe(
    mergeMap(([users]) => users),
    concatMap((users) => of(users).pipe(delay(USER_DELAY_INTERVAL))),
    mergeMap((user) => fetchUserData$(user)),
    filter(({ data }) => data.error === undefined),
    map(({ data }) => processUserData(data)),
    tap((user) => calculateBests(user)),
    retry()
  )
  .subscribe()
