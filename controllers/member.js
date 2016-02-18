'use strict'

const router = require('express').Router()
const User = require('../models/User')
const Phone = require('../models/Phone')
const phone = require('../helpers/phone')

router.post('/lookup', function (req, res, next) {
  const username = req.body.username
  const phoneNumber = req.body.phoneNumber
  if (username) {
    User.findOne({username: username}, function (err, user, next) {
      if (err) {
        return next(err)
      }
      // If no user was found
      if (!user) {
        return res.json({invalid: 'username'})
      }
      // otherwise, we found the user. let's send it back!
      res.json({
        user: {
          username: user.username,
          displayName: user.name
        }
      })
    })
  } else if (phoneNumber) {
    const normPhoneNumber = phone.convertToStandard(phoneNumber)
    // If the phone number was bad,
    if (!normPhoneNumber) {
      console.log('Failed To Normalize Phone Number ' + phoneNumber)
      return res.json({invalid: 'phoneNumber'})
    }
    Phone
      .findOne({number: normPhoneNumber})
      .select({ _id: 1 })
      .exec(function (err, phone) {
        if (err) {
          return next(err)
        }
        if (!phone) {
          // Send a blank msg back with OK status, since this is not an error.
          return res.sendStatus(204)
        }
        // otherwise, the phone is valid, so let's find the user and send it back.
        User.findOne({phone: phone._id}, function (err, user) {
          if (err) {
            return next(err)
          }
          res.json({
            user: {
              username: user.username,
              displayName: user.name
            }
          })
        })
      })
  } else {
    res.sendStatus(400)
  }
})

module.exports = router
