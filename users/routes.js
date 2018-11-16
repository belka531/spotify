const { Router } = require('express')
const User = require('./model')
const bcrypt = require('bcrypt');

const router = new Router()

router.post('/users', (req, res, next) => {
  if (!Object(req.body).hasOwnProperty('email') || req.body.email === "") {
    return res.status(400).send({
      message: `email required`
    })    
  }

  if (!Object(req.body).hasOwnProperty('password') || (req.body.password !== req.body.password_confirmation)) {
    return res.status(400).send({
      message: `Passwords do not match`
    })
  }

  const user = {
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  }
  User
    .create(user)
    .then(user => {
      if (!user) {
        return res.status(404).send({
          message: `User does not exist`
        })
      }
      return res.status(201).send(user)
    })
    .catch(error => next(error))
})

module.exports = router