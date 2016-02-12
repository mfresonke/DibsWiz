'use strict'

const loginPath = '/auth/login'

exports.isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  // IF A USER ISN'T LOGGED IN, SAVE THE STATE, THEN REDIRECT THEM
  req.session.preAuthURL = req.originalUrl
  res.redirect(loginPath)
}
