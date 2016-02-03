'use strict'
const passport = require('passport')
const User = require('../models/User')
const phone = require('../helpers/phone')
const router = require('express').Router()

const postLoginRedirect = '/'

router.get('/', function (req, res) {
  res.redirect('/', {})
})

router.get('/register', function (req, res) {
  res.render('register', {})
})

router.post('/register', function (req, res, next) {
  console.log('registering user')

  const rawPhoneNumber = req.body.phoneNumber
	// Find/Create Phone Number in DB.
  phone.findOrCreate(rawPhoneNumber, function (err, phone) {
    if (err) {
      registerError(err, next)
    }
    User.register(new User({
      username: req.body.username,
      phone: phone._id
    }), req.body.password, function (err) {
      if (err) {
        return registerError(err, next)
      }
      console.log('user registered!')

      res.redirect(postLoginRedirect)
    })
  })
})

const registerError = function (err, next) {
  console.log('error while user register!', err)
  return next(err)
}

router.get('/login', function (req, res) {
  res.render('login', {user: req.user})
})

router.post('/login', passport.authenticate('local'), function (req, res) {
  res.redirect('/')
})

router.get('/logout', function (req, res) {
  req.logout()
  res.redirect('/')
})

module.exports = router
