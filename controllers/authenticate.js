'use strict'
const passport = require('passport')
const User = require('../models/User')
const phone = require('../helpers/phone')
const router = require('express').Router()
const components = require('../helpers/components')
const path = require('path')

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
  // Find/Create Phone Number in DB.
  phone.findOrCreate(rawPhoneNumber, function (err, phone) {
    if (err) {
      return registerError(err, next)
    }
    // Create New User
    User.register(new User({
      username: req.body.username,
      name: displayName,
      phone: phone._id
    }), req.body.password, function (err, user) {
      if (err) {
        return registerError(err, next)
      }
      console.log('user ' + user.username + ' registered!')
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
  res.render('login', loginPageParams(req, false))
})

const loginPageParams = function (req, invalidLogin) {
  return {
    invalidLogin: invalidLogin,
    user: req.user,
    stylesheets: [path.join(components.publicCSS, 'signin.css')]
  }
}

router.post('/login', function (req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    if (err) {
      return next(err)
    }
    if (!user) {
      return res.render('login', loginPageParams(req, true))
    }
    req.logIn(user, function (err) {
      if (err) {
        return next(err)
      }
      return postLoginRedirect(req, res)
    })
  })(req, res, next)
// check if the user was trying to go somewhere before this.
// postLoginRedirect(req, res)
})

router.get('/logout', function (req, res) {
  req.logout()
  res.redirect('/')
})

module.exports = router
