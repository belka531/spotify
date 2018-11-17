const { Router } = require('express')
const Playlist = require('./model')
const auth = require('../auth/middleware')
const { toData } = require('../auth/jwt')
const Song =require('../songs/model')

const router = new Router()

router.get('/playlists', auth, (req, res, next) => {
  const auth = req.headers.authorization && req.headers.authorization.split(' ')
  const data = toData(auth[1])

  Playlist
    .findAll({
      where: {
        userId: data.userId
      }
    })
    .then(playlists => {
      res.send({ playlists })
    })
    .catch(error => next(error))
})

router.get('/playlists/:id', auth, (req, res, next) => {
  const auth = req.headers.authorization && req.headers.authorization.split(' ')
  const data = toData(auth[1])

  Playlist
    .findOne({
      where:{
        id: req.params.id,
        userId: data.userId,
      }
    })
    .then(playlist => {
      if (!playlist) {
        return res.status(404).send({
          message: `Could not find playlist`
        })
      }
      
      playlist
        .getSongs()
        .then(songs => {
          if (!songs) {
            return res.send(playlist)
          }

          return res.send({
            name: playlist.name,
            songs: songs,
          })
        })
    })
    .catch(error => next(error))
})

router.post('/playlists', auth, (req, res, next) => {
  const auth = req.headers.authorization && req.headers.authorization.split(' ')
  const data = toData(auth[1])

  if (!req.body.name) {
    return res.status(400).send({
      message: `Invalid name of playlist`
    })
  }

  Playlist
    .create({
      userId: data.userId,
      name: req.body.name
    })
    .then(playlist => {
      if (!playlist) {
        return res.status(404).send({
          message: `Could not create playlist`,
        })
      }
      return res.status(201).send(playlist)
    })
    .catch(error => next(error))
})

router.delete('/playlists/:id', auth, (req, res, next) => {
  const auth = req.headers.authorization && req.headers.authorization.split(' ')
  const data = toData(auth[1])

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
          message: `Could not find playlist`,
        })
      }

      Song
        .destroy({
          where: {
            playlistId: playlist.id
          }
        })
        .then(() => {
          playlist.destroy().then(() => {
            return res.status(200).send({
              message: `Playlist deleted`,
            })
          })
          .catch(error => next(error))
        })
        .catch(error => next(error))
    })
    .catch(error => next(error))
})

module.exports = router