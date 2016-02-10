'use strict'

const router = require('express').Router()
const User = require('../models/User')
const Phone = require('../models/Phone')
const phone = require('../helpers/phone')

router.post('/lookup', function (req, res, next) {
  const username = req.body.username
  const phoneNumber = req.body.phoneNumber
  console.log(req.body)
  if (username) {
    User.findOne({username: username}, function (err, user) {
      if (err) {
        console.log(err)
        throw new Error('There was an error looking up username: ' + username)
      }
      console.log(user)
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
    console.log('Detected Phone Number')
    const normPhoneNumber = phone.convertToStandard(phoneNumber)
    console.log('Normalized Number: ' + normPhoneNumber)
    // If the phone number was bad,
    if (!normPhoneNumber) {
      console.log('Failed To Normalize Phone Number ' + phoneNumber)
      return res.json({invalid: 'phoneNumber'})
    }
    Phone
      .findOne({number: normPhoneNumber})
      .populate('user')
      .exec(function (err, phone) {
        if (err) {
          console.log(err)
          return next(new Error('There was an error looking up phoneNumber: ' + phoneNumber))
        }
        if (!phone) {
          console.log('Could not find phone ' + phoneNumber)
          // Send a blank msg back with OK status, since this is not an error.
          return res.sendStatus(204)
        }
        // otherwise, send back the valid user.
        res.json({
          user: {
            username: phone.user.username,
            displayName: phone.user.name
          }
        })
      })
  } else {
    res.sendStatus(400)
  }
})

module.exports = router
