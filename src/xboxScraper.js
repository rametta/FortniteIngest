const { db, app } = require('./initFirebase')
const { keys } = require('ramda')
const axios = require('axios')
const { XBOX_API_URL, XBOX_API_KEY } = require('./constants')
const { logger } = require('./logger')
const moment = require('moment')

const headers = { 'X-AUTH': XBOX_API_KEY }

const removeDashes = (word) => word.replace(/-/g, '')

const trimClip = (clip) => ({
  id: removeDashes(clip.gameClipId),
  thumbnail:
    clip.thumbnails.find(
      (t) => t.thumbnailType.toLowerCase() === 'large'.uri
    ) || clip.thumbnails[0].uri,
  video: clip.gameClipUris[0].uri,
  duration: clip.durationInSeconds,
  date: moment(clip.dateRecorded)
    .utc()
    .format(),
  lastUpdate: moment()
    .utc()
    .format()
})

const getUrl = (id) => `${XBOX_API_URL}/${id}/game-clips/267695549`

const getData = (id) => axios.get(getUrl(id), { headers })

db.ref(`xboxUsers`).once('value', (snap) => {
  const usersMap = snap.val()
  const users = keys(usersMap)

  let count = 0

  users.forEach((user) => {
    logger.info(`Fetching clips for user ${user}`)
    getData(usersMap[user].xuid)
      .then(({ data }) => {
        count++
        const clips = data.reduce((acc, c) => {
          const clip = trimClip(c)
          acc[clip.id] = clip
          return acc
        }, {})
        db.ref(`clips/${user}`).set(clips)

        // Free up resources when all users are processed
        // to prevent memory leak because app will never quit
        if (count === users.length) {
          app.delete()
        }
      })
      .catch((err) => {
        logger.error(
          err.message || `Could not fetch Game Clips for user ${user}`
        )
      })
  })
})
