const { fetchUserData } = require('./fetchUserData')
const { processUserData } = require('./processUserData')
const { db } = require('./initFirebase')

const app = () => {
  db.ref('/users').once('value', (snap) => {
    const usersMap = snap.val()
    const users = Object.values(usersMap)
    users.map((user, i) => {
      setTimeout(() => {
        fetchUserData(user)
          .then(({ data }) => data.error === undefined && processUserData(data))
          .catch((err) => console.error(err))
      }, 2000 * (i + 1))
    })
  })
}

app()
