const axios = require('axios')
const Rx = require('rxjs/Rx')
const admin = require('firebase-admin')

// Constants
const firebaseServiceAccount = require('./firebase-admin-creds.json')
const firebaseDbUrl = 'https://fortnite-ingest.firebaseio.com/'
const API = 'https://api.fortnitetracker.com/v1/profile/xbox/'
const headers = { 'TRN-Api-Key': '3fdd40fe-6913-4b08-8806-d61c600680a9' }
const userDelayInterval = 2000 // api limit
const refreshInterval = 10000

// Connect to firebase
admin.initializeApp({
  credential: admin.credential.cert(firebaseServiceAccount),
  databaseURL: firebaseDbUrl,
  databaseAuthVariableOverride: {
    uid: 'ingest'
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

const schedule$ = Rx.Observable.interval(refreshInterval)

users$
  .switchMap((users) => schedule$, (users) => users)
  .mergeAll()
  .concatMap((user) => Rx.Observable.of(user).delay(userDelayInterval))
  .mergeMap((user) => getUserData$(user))
  .map((res) => res.data)
  .retry()
  .subscribe(
    (data) => {
      // TODO: process data here and save back to db
      console.log(data.epicUserHandle)
    },
    (err) => console.error(err)
  )

// Helper for accessing data from 3rd party api
const getUserData$ = (user) => {
  const url = API + user
  const promise = axios.get(url, { headers })
  return Rx.Observable.from(promise)
}
