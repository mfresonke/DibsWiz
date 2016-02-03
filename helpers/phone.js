'use strict'

const phone = require('node-phonenumber')
const Phone = require('../models/Phone')

/* Static Helper Methods */

/**
 * Callback for recieving a phone number.
 *
 * @callback phoneCallback
 * @param {Error} err - error if error occured.
 * @param {Phone} phone - found or created phone object from DB.
 */

/**
 * Find a Phone Number, and Create It If It Doesn't Exist.
 *
 * @param {string} rawPhoneNum - The phone number we wish to search for.
 * @param {phoneCallback} phoneNumberCallback - A callback to run after phone number is found/created.
 */
exports.findOrCreate = function (rawPhoneNum, phoneCallback) {
  const phoneNumber = convertToStandard(rawPhoneNum)
  // check that number is valid.
  if (!phoneNumber) {
    phoneCallback(new Error('Phone Number Invalid'), null)
    return
  }

  // attempt to find the number in the db.
  Phone.findOne({number: phoneNumber}, function (err, phone) {
    if (err) {
      throw new Error('Error occured when searching the DB for ' + phoneNumber)
    }
    // if a phone was found, simply pass it to the callback.
    if (phone) {
      phoneCallback(null, phone)
      return
    }
    // if a phone number was not found, create a new Phone instance and save it to the DB.
    phone = new Phone({number: phoneNumber})
    phone.save(function (err, phone) {
      if (err) {
        throw new Error('Error occured when saving ' + phoneNumber + ' to the DB.')
      }
      // success! Let's pass the newly created phone to the callback.
      phoneCallback(null, phone)
    })
  })
}

const lengthOfUSNumber = '+14071234567'.length

/**
 * Format a number to the proper US type, making sure input is valid.
 *
 * @param {string} rawPhoneNum - The phone number to convert.
 * @return {string|null} String if phone number is valid, null if phone number is invalid.
 */
exports.convertToStandard = function (rawPhoneNum) {
  const phoneUtil = phone.PhoneNumberUtil.getInstance()
  const phoneNumberObj = phoneUtil.parse(rawPhoneNum, 'US')
  if (phoneNumberObj === undefined) {
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
