'use strict'

const phone = require('node-phonenumber')
const Phone = require('../models/Phone')

/* Static Helper Methods */

/**
 * Callback for recieving a found or created phone number.
 *
 * @callback phoneCallback
 * @param {Error} err - error if error occured.
 * @param {Phone} phone - found or created phone object from DB.
 */

/**
 * Find a Phone Number, and Create It If It Doesn't Exist.
 *
 * @param {string} rawPhoneNum - The phone number we wish to search for or create.
 * @param {phoneCallback} phoneNumberCallback - A callback to run after phone number is found/created.
 */
exports.findOrCreate = function (rawPhoneNum, callback) {
  const phoneNumber = convertToStandard(rawPhoneNum)
  // check that number is valid.
  if (!phoneNumber) {
    callback(new Error('Phone Number Invalid'))
    return
  }
  // Update the Phone Obj If It Exists
  Phone.findOne({number: phoneNumber}, function (err, phone) {
    if (err) {
      return callback(err)
    }
    if (phone) {
      // We're done! Call the callback.
      return callback(null, phone)
    }
    // otherwise, create a new phone instance.
    Phone.create({number: phoneNumber}, callback)
  }
  )
}

const lengthOfUSNumber = '+14071234567'.length

/**
 * Format a number to the proper US type, making sure input is valid.
 *
 * @param {string} rawPhoneNum - The phone number to convert.
 * @return {string|null} String if phone number is valid, null if phone number is invalid.
 */
const convertToStandard = function (rawPhoneNum) {
  const phoneUtil = phone.PhoneNumberUtil.getInstance()
  let phoneNumberObj = null
  try {
    phoneNumberObj = phoneUtil.parse(rawPhoneNum, 'US')
  } catch (e) {
    // console.log('Phone normalization threw an exception. WTF?')
    return null
  }

  if (!phoneNumberObj) {
    // phone number could not be parsed. Not a valid phone number.
    return null
  }
  const phoneNumber = phoneUtil.format(phoneNumberObj, phone.PhoneNumberFormat.E164)
  if (phoneNumber.length !== lengthOfUSNumber) {
    // phone number has incorrect length. most likely invalid.
    return null
  }
  return phoneNumber
}
exports.convertToStandard = convertToStandard

// fill is middleware that fills the req object with a .phone item.
exports.addToReq = function (req, res, next) {
  Phone.findById(req.user.phone, function (err, phone) {
    if (err) {
      return next(err)
    }
    req.phone = phone
    return next()
  })
}

// If I need to search phone and populate, steal it from member.js
