const { Router } = require('express')
const Song = require('./model')
const auth = require('../auth/middleware')
const { toData } = require('../auth/jwt')
const Playlist = require('../playlists/model')
const Promise = require("bluebird");


const router = new Router()

router.post('/playlists/:id/songs', auth, (req, res, next) => {
  const auth = req.headers.authorization && req.headers.authorization.split(' ')
  const data = toData(auth[1])

  if (!req.body.title) {
    return res.status(400).send({
      message: `Invalid title of song`
    })
  }
  if (!req.body.artist) {
    return res.status(400).send({
      message: `Invalid artist of song`
    })
  }
  if (!req.body.album) {
    return res.status(400).send({
      message: `Invalid album of song`
    })
  }

  Playlist
    .findOne({
      where: {
        userId: data.userId,
        id: req.params.id,
      }
    })
    .then(playlist => {
      if (!playlist) {
        return res.status(404).send({
          message: `Could not found playlist`
        })
      }

      Song
        .create({
          title: req.body.title,
          artist: req.body.artist,
          album: req.body.album,
          playlistId: playlist.id,
        })
        .then(song => {
          if (!song) {
            return res.status(404).send({
              message: `Song does not exist`
            })
          }
          return res.status(201).send(song)
        })
        .catch(error => next(error))
    })
    .catch(error => next(error))
})

router.get('/artists', auth, (req, res, next) => {
  const auth = req.headers.authorization && req.headers.authorization.split(' ')
  const data = toData(auth[1])

  Playlist
    .findAll({
      where: {
        userId: data.userId,
      }
    })
    .then(playlists => {
      const ids = playlists.map(pl=> pl.id)
      Song
        .findAll({
          where: {
            playlistId: ids,
          }
        })
        .then(songs => {
          return res.send(songs)
        })
        .catch(error => next(error))
    })
    .catch(error => next(error))
})

router.delete('/playlists/:id/songs/:songId', auth, (req, res, next) => {
  const auth = req.headers.authorization && req.headers.authorization.split(' ')
  const data = toData(auth[1])
  
  Playlist
    .findOne({
      where: {
        userId: data.userId,
        id: req.params.id
      }
    })
    .then(playlist => {
      if (!playlist) {
        return res.status(404).send({
          message: `Could not find playlist`
        })
      }
      Song
        .destroy({
          where:{
            id: req.params.songId,
            playlistId: playlist.id
          }
        })
        .then(() => {
          return res.status(204).send({
            message: `Song deleted`
          })
        })
        .catch(error => next(error))
    })
    .catch(error => next(error))
})

router.put('/playlists/:id/songs/:songId', auth, (req, res, next) => {
  const auth = req.headers.authorization && req.headers.authorization.split(' ')
  const data = toData(auth[1])

  Playlist
    .findOne({
      where: {
        userId: data.userId,
        id: req.params.id
      }
    })
    .then(playlist => {
      if (!playlist) {
        return res.status(404).send({
          message: `Could not find playlist`
        })
      }

      Song
        .findOne({
          where: {
            id: req.params.songId,
            playlistId: playlist.id,
          }
        })
        .then(song => {
          if (!song) {
            return res.status(404).send({
              message: `Could not find song`
            })
          }

          return song.update(req.body).then(song => res.send(song))
        })
        .catch(error => next(error))
    })
    .catch(error => next(error))
  })

module.exports = router