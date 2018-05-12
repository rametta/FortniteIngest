const { db } = require('./initFirebase')
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

db.ref(`usersV2`).once('value', (snap) => {
  const usersMap = snap.val()
  const userIds = keys(usersMap)

  // Update user profiles
  userIds.forEach((id) => {
    const url = `${XBOX_API_URL}/${id}/profile`
    axios
      .get(url, { headers })
      .then(({ data }) => {
        db.ref(`usersV2/${id}`).set({
          xboxGt: data.Gamertag,
          xboxScore: data.Gamerscore,
          xboxPic: data.GameDisplayPicRaw,
          lastUpdate: moment()
            .utc()
            .format()
        })
      })
      .catch(() =>
        logger.error(
          `Could not fetch Xbox profile for user ${usersMap[id].xboxGt}`
        )
      )
  })

  // Update game clips
  userIds.forEach((id) => {
    const url = `${XBOX_API_URL}/${id}/game-clips/267695549`
    axios
      .get(url, { headers })
      .then(({ data }) => {
        data.forEach((c) => {
          const clip = trimClip(c)
          db.ref(`clips/${usersMap[id].xboxGt}/${clip.id}`).set(clip)
        })
      })
      .catch(() =>
        logger.error(
          `Could not fetch Game Clips for user ${usersMap[id].xboxGt}`
        )
      )
  })
})
