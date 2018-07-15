const { fetchUserData } = require('./fetchUserData')
const { processUserData } = require('./processUserData')
const { db, app } = require('./initFirebase')

const io = () => {
  db.ref('/users').once('value', (snap) => {
    const users = Object.values(snap.val())

    users.map((user, i) => {
      setTimeout(() => {
        fetchUserData(user)
          .then(({ data }) => {
            if (data.error === undefined) {
              const { dataWDate, matches } = processUserData(data)

              const updates = matches.reduce((acc, m) => {
                acc[`/matches/${data.epicUserHandle}/${m.mid}`] = m
                return acc
              }, {})

              updates[`/data/${dataWDate.epicUserHandle}`] = dataWDate

              db.ref('/')
                .update(updates)
                .then(() => {
                  console.log(`${data.epicUserHandle} updated`)

                  if (i + 1 === users.length) {
                    console.log(`Completed ${i + 1}/${users.length} - Exiting`)
                    app.delete()
                  }
                })
                .catch(() => {
                  console.log(`${data.epicUserHandle} error`)
                  app.delete()
                })
            }
          })
          .catch((err) => console.error(err))
      }, 2000 * (i + 1))
    })
  })
}

io()
