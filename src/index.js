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
const { fetchUserData$ } = require('./fetchUserData')
const { processUserData } = require('./processUserData')
const { calculateBests } = require('./calculateBests')
const { db } = require('./initFirebase')
const { logger } = require('./logger')
const constants = require('./constants')

if (!fs.existsSync(constants.LOGS_DIR)) {
  fs.mkdirSync(constants.LOGS_DIR)
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

const timer$ = timer(0, constants.REFRESH_INTERVAL)

combineLatest(users$, timer$)
  .pipe(
    mergeMap(([users]) => users),
    concatMap((users) => of(users).pipe(delay(constants.USER_DELAY_INTERVAL))),
    mergeMap((user) => fetchUserData$(user)),
    filter(({ data }) => data.error === undefined),
    map(({ data }) => processUserData(data)),
    tap((user) => calculateBests(user)),
    retry()
  )
  .subscribe()
