const axios = require('axios')
const Rx = require('rxjs/Rx')
const admin = require('firebase-admin')

// Constants
const firebaseServiceAccount = require('./firebase-admin-creds.json')
const firebaseDbUrl = 'https://fortnite-ingest.firebaseio.com/'
const API = 'https://api.fortnitetracker.com/v1/profile/xbox/'
const headers = { 'TRN-Api-Key': '3fdd40fe-6913-4b08-8806-d61c600680a9' }
const delayInterval = 2000

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
  userRef.on('child_added', (snapshot) => {
    const user = snapshot.val()
    // const users = Object.keys(userMap).map((key) => userMap[key])
    observer.next(user)
    // startIngest(users)
  })
})

users$.subscribe({
  next: (users) => console.log(users),
  error: (err) => console.error('Could not retrieve users: ' + err),
  complete: () => console.log('Users complete')
})

// Helper for accessing data from 3rd party api
const getUserData$ = (user) => {
  const url = API + user
  const promise = axios.get(url, { headers })
  return Rx.Observable.from(promise)
}

// Ingest user data from fortnite api
const startIngest = (users) => {
  Rx.Observable.from(users)
    .concatMap((user) => Rx.Observable.of(user).delay(delayInterval))
    .mergeMap((user) => getUserData$(user))
    .map((res) => res.data)
    .subscribe((res) => {
      // TODO: Save back to db
      console.log(res.accountId)
    })
}
