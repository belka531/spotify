const express = require('express')
const bodyParser = require('body-parser')
const playlistRouter = require('./playlists/routes')
const authRouter = require('./auth/routes')
const userRouter = require('./users/routes')
const songRouter = require('./songs/routes')

const app = express()
const port = process.env.PORT || 4000

app
  .use(bodyParser.json())
  .use(playlistRouter)
  .use(userRouter)
  .use(authRouter)
  .use(songRouter)
  .listen(port, () => console.log(`Listening on port ${port}`))




