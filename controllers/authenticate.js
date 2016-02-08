'use strict'
const passport = require('passport')
const User = require('../models/User')
const phone = require('../helpers/phone')
const router = require('express').Router()

const postLoginRedirect = function (req, res) {
  const preAuthURL = req.session.preAuthURL
  if (preAuthURL) {
    req.session.preAuthURL = null
    res.redirect(preAuthURL)
  } else {
    res.redirect('/')
  }
}

router.get('/', function (req, res) {
  res.redirect('/', {})
})

router.get('/register', function (req, res) {
  res.render('register', {})
})

router.post('/register', function (req, res, next) {
  console.log('registering user')
  const displayName = req.body.displayName
  const rawPhoneNumber = req.body.phoneNumber
  console.log('Nickname: ' + displayName + ', RawNum: ' + rawPhoneNumber)
  // Create New User
  User.register(new User({username: req.body.username, name: displayName}), req.body.password, function (err, user) {
    if (err) {
      return registerError(err, next)
    }
    console.log('user registered!')

    // Find/Create Phone Number in DB.
    phone.findOrCreate(user._id, rawPhoneNumber, function (err, phone) {
      if (err) {
        registerError(err, next)
        return
      }
      req.logIn(user, function (err) {
        if (err) {
          console.log('Error Logging In User.')
        }
        postLoginRedirect(req, res)
      })
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
  // check if the user was trying to go somewhere before this.
  postLoginRedirect(req, res)
})

router.get('/logout', function (req, res) {
  req.logout()
  res.redirect('/')
})

module.exports = router
